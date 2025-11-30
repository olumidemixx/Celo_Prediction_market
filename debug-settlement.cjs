const hre = require("hardhat");

async function debugSettlement() {
    try {
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
        
        console.log('🔍 Debug Settlement Script');
        console.log('MarketManager:', marketManagerAddress);
        console.log('Current time:', Math.floor(Date.now()/1000));
        
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];
        
        for (const market of markets) {
            console.log(`\n--- ${market} Market ---`);
            
            try {
                const marketInfo = await marketManager.getMarketInfo(market);
                console.log(`Current round: ${marketInfo.currentRound}`);
                
                if (marketInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
                    const round = await hre.ethers.getContractAt('PredictionRound', marketInfo.currentRound);
                    
                    const roundInfo = await round.getRoundInfo();
                    const endTime = roundInfo[5].toString();
                    const settled = roundInfo[8];
                    const currentTime = Math.floor(Date.now()/1000);
                    
                    console.log(`End time: ${endTime}`);
                    console.log(`Current time: ${currentTime}`);
                    console.log(`Time remaining: ${endTime - currentTime} seconds`);
                    console.log(`Should settle: ${currentTime >= endTime && !settled}`);
                    console.log(`Already settled: ${settled}`);
                    
                    if (currentTime >= endTime && !settled) {
                        console.log(`🎯 This round needs settlement!`);
                    }
                }
                
            } catch (error) {
                console.error(`Error checking ${market}:`, error.message);
            }
        }
        
        console.log('\n🚀 Attempting settlement...');
        const tx = await marketManager.settleAllExpiredRounds();
        console.log('📋 Transaction hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        
        console.log('\n📊 Checking results after settlement...');
        for (const market of markets) {
            console.log(`\n--- ${market} After Settlement ---`);
            
            try {
                const marketInfo = await marketManager.getMarketInfo(market);
                console.log(`New current round: ${marketInfo.currentRound}`);
                console.log(`Round count: ${marketInfo.roundCount.toString()}`);
                
                if (marketInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
                    const round = await hre.ethers.getContractAt('PredictionRound', marketInfo.currentRound);
                    const roundInfo = await round.getRoundInfo();
                    console.log(`New round settled: ${roundInfo[8]}`);
                }
                
            } catch (error) {
                console.error(`Error checking ${market} after settlement:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugSettlement().catch(console.error);