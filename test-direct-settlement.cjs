const hre = require("hardhat");

async function testDirectSettlement() {
    try {
        console.log('🧪 Testing Direct Settlement');
        
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
        console.log(`Strike price: ${roundInfo[1].toString()}`);
        
        // Check current time
        const currentTime = Math.floor(Date.now()/1000);
        console.log(`Current time: ${currentTime}`);
        console.log(`Should settle: ${currentTime >= roundInfo[5].toString() && !roundInfo[8]}`);
        
        // Try to settle directly
        console.log('\n🚀 Attempting direct settlement...');
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
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
}

testDirectSettlement().catch(console.error);