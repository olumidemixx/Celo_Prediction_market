const hre = require("hardhat");

async function verifyConstants() {
    try {
        const [signer] = await hre.ethers.getSigners();
        console.log(`Connected to network: ${hre.network.name}`);
        console.log(`Signer address: ${signer.address}`);
        
        // Get the MarketManager address from the latest deployment
        const marketManagerAddress = '0x40026B1E50B6105f29b2E2dA59FBE3ef0A79D4cD';
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        // Get the PredictionRound implementation address
        const predictionRoundImplementation = await marketManager.roundImplementation();
        console.log(`PredictionRound Implementation: ${predictionRoundImplementation}`);
        
        // Test with a specific round
        const currentRound = await marketManager.getCurrentRound('BTC');
        console.log(`BTC Current Round: ${currentRound}`);
        
        const round = await hre.ethers.getContractAt('PredictionRound', currentRound);
        
        // Try to call the constants directly
        try {
            const entryDuration = await round.ENTRY_DURATION();
            const totalDuration = await round.TOTAL_DURATION();
            console.log(`ENTRY_DURATION constant: ${entryDuration.toString()}`);
            console.log(`TOTAL_DURATION constant: ${totalDuration.toString()}`);
        } catch (error) {
            console.log(`Error accessing constants: ${error.message}`);
        }
        
        // Check the actual timing
        const startTime = Number(await round.startTime());
        const entryDeadline = Number(await round.entryDeadline());
        const endTime = Number(await round.endTime());
        
        console.log(`Start Time: ${startTime.toString()}`);
        console.log(`Entry Deadline: ${entryDeadline.toString()}`);
        console.log(`End Time: ${endTime.toString()}`);
        
        const actualEntryDuration = entryDeadline - startTime;
        const actualTotalDuration = endTime - startTime;
        
        console.log(`Actual Entry Duration: ${actualEntryDuration} seconds (${actualEntryDuration / 60} minutes)`);
        console.log(`Actual Total Duration: ${actualTotalDuration} seconds (${actualTotalDuration / 60} minutes)`);
        
        // Check if there's a discrepancy
        const expectedEntryDuration = 240;
        const expectedTotalDuration = 300;
        
        if (actualEntryDuration !== expectedEntryDuration) {
            console.log(`❌ ENTRY_DURATION mismatch! Expected: ${expectedEntryDuration}, Got: ${actualEntryDuration}`);
        } else {
            console.log(`✅ ENTRY_DURATION matches expected value`);
        }
        
        if (actualTotalDuration !== expectedTotalDuration) {
            console.log(`❌ TOTAL_DURATION mismatch! Expected: ${expectedTotalDuration}, Got: ${actualTotalDuration}`);
        } else {
            console.log(`✅ TOTAL_DURATION matches expected value`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyConstants().then(() => process.exit(0));