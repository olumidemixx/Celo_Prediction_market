const hre = require("hardhat");

async function checkDeployedConstants() {
    try {
        // Use celoSepolia network since that's where contracts are deployed
        const [signer] = await hre.ethers.getSigners();
        console.log(`Connected to network: ${hre.network.name}`);
        console.log(`Signer address: ${signer.address}`);
        
        const marketManagerAddress = '0x5220B9bfA9d9e6Ace1D0917dA9BfA6e50baCc888';
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ["BTC", "ETH", "SOL", "BNB"];
        
        for (const marketName of markets) {
            console.log(`\n=== ${marketName} Market ===`);
            
            const currentRound = await marketManager.getCurrentRound(marketName);
            if (currentRound === '0x0000000000000000000000000000000000000000') {
                console.log("No active round");
                continue;
            }
            
            const round = await hre.ethers.getContractAt('PredictionRound', currentRound);
            
            // Check if the contract has these constants as public functions
            try {
                const entryDuration = await round.ENTRY_DURATION();
                const totalDuration = await round.TOTAL_DURATION();
                
                console.log(`ENTRY_DURATION: ${entryDuration} seconds (${entryDuration / 60} minutes)`);
                console.log(`TOTAL_DURATION: ${totalDuration} seconds (${totalDuration / 60} minutes)`);
                
                const startTime = await round.startTime();
                const entryDeadline = await round.entryDeadline();
                const endTime = await round.endTime();
                
                console.log(`Actual Entry Period: ${(entryDeadline - startTime)} seconds`);
                console.log(`Actual Round Period: ${(endTime - entryDeadline)} seconds`);
                console.log(`Actual Total Duration: ${(endTime - startTime)} seconds`);
                
            } catch (error) {
                console.log(`Constants not accessible: ${error.message}`);
                
                // Fallback to getRoundInfo
                const roundInfo = await round.getRoundInfo();
                const startTime = Number(roundInfo[3]);
                const entryDeadline = Number(roundInfo[4]);
                const endTime = Number(roundInfo[5]);
                
                console.log(`Entry Period: ${(entryDeadline - startTime)} seconds (${(entryDeadline - startTime) / 60} minutes)`);
                console.log(`Round Period: ${(endTime - entryDeadline)} seconds (${(endTime - entryDeadline) / 60} minutes)`);
                console.log(`Total Duration: ${(endTime - startTime)} seconds (${(endTime - startTime) / 60} minutes)`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDeployedConstants().then(() => process.exit(0));