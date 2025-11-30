const hre = require("hardhat");

async function checkRoundTiming() {
    try {
        // Use celoSepolia network since that's where contracts are deployed
        await hre.run("compile");
        const network = hre.network.name;
        console.log(`Using network: ${network}`);
        
        // Connect to celoSepolia network
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
            const roundInfo = await round.getRoundInfo();
            
            const startTime = Number(roundInfo[3]);
            const entryDeadline = Number(roundInfo[4]);
            const endTime = Number(roundInfo[5]);
            const now = Math.floor(Date.now() / 1000);
            
            console.log(`Start Time: ${new Date(startTime * 1000).toLocaleTimeString()}`);
            console.log(`Entry Deadline: ${new Date(entryDeadline * 1000).toLocaleTimeString()}`);
            console.log(`End Time: ${new Date(endTime * 1000).toLocaleTimeString()}`);
            console.log(`Current Time: ${new Date(now * 1000).toLocaleTimeString()}`);
            
            console.log(`Entry Period: ${(entryDeadline - startTime)} seconds (${(entryDeadline - startTime) / 60} minutes)`);
            console.log(`Round Period: ${(endTime - entryDeadline)} seconds (${(endTime - entryDeadline) / 60} minutes)`);
            console.log(`Total Duration: ${(endTime - startTime)} seconds (${(endTime - startTime) / 60} minutes)`);
            
            if (now < entryDeadline) {
                console.log(`Entry closes in: ${(entryDeadline - now)} seconds (${(entryDeadline - now) / 60} minutes)`);
            } else if (now < endTime) {
                console.log(`Round ends in: ${(endTime - now)} seconds (${(endTime - now) / 60} minutes)`);
            } else {
                console.log("Round has ended");
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkRoundTiming().then(() => process.exit(0));