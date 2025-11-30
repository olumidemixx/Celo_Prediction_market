const hre = require("hardhat");

async function testSettleAndCreateNext() {
    try {
        console.log('🧪 Testing settleAndCreateNext Function');
        
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        // Test with BTC market
        const market = 'BTC';
        console.log(`\n--- ${market} Market ---`);
        
        // Check before
        const beforeInfo = await marketManager.getMarketInfo(market);
        console.log(`Before - Current round: ${beforeInfo.currentRound}`);
        console.log(`Before - Round count: ${beforeInfo.roundCount.toString()}`);
        
        if (beforeInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
            const beforeRound = await hre.ethers.getContractAt('PredictionRound', beforeInfo.currentRound);
            const beforeRoundInfo = await beforeRound.getRoundInfo();
            console.log(`Before - Round settled: ${beforeRoundInfo[7]}`);
            console.log(`Before - Round end time: ${beforeRoundInfo[5].toString()}`);
        }
        
        // Call settleAndCreateNext
        console.log('\n🚀 Calling settleAndCreateNext...');
        const tx = await marketManager.settleAndCreateNext(market);
        console.log('📋 Transaction hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        
        // Check after
        const afterInfo = await marketManager.getMarketInfo(market);
        console.log(`\nAfter - Current round: ${afterInfo.currentRound}`);
        console.log(`After - Round count: ${afterInfo.roundCount.toString()}`);
        
        if (afterInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
            const afterRound = await hre.ethers.getContractAt('PredictionRound', afterInfo.currentRound);
            const afterRoundInfo = await afterRound.getRoundInfo();
            console.log(`After - New round start time: ${afterRoundInfo[3].toString()}`);
            console.log(`After - New round end time: ${afterRoundInfo[5].toString()}`);
            console.log(`After - New round settled: ${afterRoundInfo[7]}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testSettleAndCreateNext().catch(console.error);