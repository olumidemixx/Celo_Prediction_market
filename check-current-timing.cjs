const hre = require("hardhat");

async function checkCurrentTiming() {
    try {
        const [signer] = await hre.ethers.getSigners();
        console.log(`Connected to network: ${hre.network.name}`);
        console.log(`Signer address: ${signer.address}`);
        
        // Use the new MarketManager address
        const marketManagerAddress = '0x40026B1E50B6105f29b2E2dA59FBE3ef0A79D4cD';
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ["BTC", "ETH", "SOL", "BNB"];
        
        for (const marketName of markets) {
            console.log(`\n=== ${marketName} Market ===`);
            
            const currentRound = await marketManager.getCurrentRound(marketName);
            if (currentRound === '0x0000000000000000000000000000000000000000') {
                console.log("No active round");
                continue;
            }
            
            console.log(`Current Round Address: ${currentRound}`);
            
            const round = await hre.ethers.getContractAt('PredictionRound', currentRound);
            
            // Get the actual timing values
            const startTime = Number(await round.startTime());
            const entryDeadline = Number(await round.entryDeadline());
            const endTime = Number(await round.endTime());
            const now = Math.floor(Date.now() / 1000);
            
            console.log(`Start Time: ${new Date(startTime * 1000).toLocaleTimeString()}`);
            console.log(`Entry Deadline: ${new Date(entryDeadline * 1000).toLocaleTimeString()}`);
            console.log(`End Time: ${new Date(endTime * 1000).toLocaleTimeString()}`);
            console.log(`Current Time: ${new Date(now * 1000).toLocaleTimeString()}`);
            
            const entryDuration = entryDeadline - startTime;
            const roundDuration = endTime - entryDeadline;
            const totalDuration = endTime - startTime;
            
            console.log(`Entry Duration: ${entryDuration} seconds (${entryDuration / 60} minutes)`);
            console.log(`Round Duration: ${roundDuration} seconds (${roundDuration / 60} minutes)`);
            console.log(`Total Duration: ${totalDuration} seconds (${totalDuration / 60} minutes)`);
            
            // Check if this matches the constants
            const entryDurationConst = Number(await round.ENTRY_DURATION());
            const totalDurationConst = Number(await round.TOTAL_DURATION());
            
            console.log(`Expected Entry Duration: ${entryDurationConst} seconds`);
            console.log(`Expected Total Duration: ${totalDurationConst} seconds`);
            
            if (entryDuration === entryDurationConst) {
                console.log(`✅ Entry duration matches constant`);
            } else {
                console.log(`❌ Entry duration mismatch! Expected: ${entryDurationConst}, Got: ${entryDuration}`);
            }
            
            if (totalDuration === totalDurationConst) {
                console.log(`✅ Total duration matches constant`);
            } else {
                console.log(`❌ Total duration mismatch! Expected: ${totalDurationConst}, Got: ${totalDuration}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkCurrentTiming().then(() => process.exit(0));