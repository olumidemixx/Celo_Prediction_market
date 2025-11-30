const hre = require("hardhat");

async function testEmptyRoundSettlement() {
    try {
        console.log('🧪 Testing Empty Round Settlement');
        
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        // Get BTC round
        const btcRoundAddress = await marketManager.getCurrentRound('BTC');
        console.log(`BTC Round: ${btcRoundAddress}`);
        
        const btcRound = await hre.ethers.getContractAt('PredictionRound', btcRoundAddress);
        
        // Check round info
        const roundInfo = await btcRound.getRoundInfo();
        console.log(`End time: ${roundInfo[5].toString()}`);
        console.log(`Settled: ${roundInfo[8]}`);
        console.log(`Total pool: ${roundInfo[6].toString()}`);
        console.log(`Participants: ${roundInfo[11]}`);
        
        // Check participant count
        const participantCount = await btcRound.getParticipantCount();
        console.log(`Participant count: ${participantCount.toString()}`);
        
        // Try to settle directly
        console.log('\n🚀 Attempting direct settlement...');
        try {
            const tx = await btcRound.settle();
            console.log('📋 Transaction hash:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
            
            // Check if settled
            const newRoundInfo = await btcRound.getRoundInfo();
            console.log(`After settlement:`);
            console.log(`  Settled: ${newRoundInfo[8]}`);
            console.log(`  Final price: ${newRoundInfo[2].toString()}`);
            console.log(`  Above wins: ${newRoundInfo[9]}`);
            console.log(`  Is draw: ${newRoundInfo[10]}`);
            
        } catch (settleError) {
            console.error('❌ Settlement failed:', settleError.message);
            
            // Try to call settleAndCreateNext from MarketManager instead
            console.log('\n🔄 Trying settleAndCreateNext from MarketManager...');
            const tx2 = await marketManager.settleAndCreateNext('BTC');
            console.log('📋 Transaction hash:', tx2.hash);
            
            const receipt2 = await tx2.wait();
            console.log('✅ settleAndCreateNext confirmed in block:', receipt2.blockNumber);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEmptyRoundSettlement().catch(console.error);