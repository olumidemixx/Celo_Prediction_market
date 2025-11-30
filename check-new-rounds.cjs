const hre = require("hardhat");

async function checkNewRounds() {
    try {
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
        
        console.log('🔍 Checking for New Rounds After Settlement');
        
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];
        
        for (const market of markets) {
            console.log(`\n--- ${market} Market ---`);
            
            try {
                const marketInfo = await marketManager.getMarketInfo(market);
                console.log(`Current round: ${marketInfo.currentRound}`);
                console.log(`Round count: ${marketInfo.roundCount.toString()}`);
                
                if (marketInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
                    const round = await hre.ethers.getContractAt('PredictionRound', marketInfo.currentRound);
                    const roundInfo = await round.getRoundInfo();
                    
                    const currentTime = Math.floor(Date.now()/1000);
                    const endTime = roundInfo[5].toString();
                    
                    console.log(`Round details:`);
                    console.log(`  Start time: ${roundInfo[3].toString()}`);
                    console.log(`  End time: ${endTime}`);
                    console.log(`  Time until end: ${endTime - currentTime} seconds`);
                    console.log(`  Settled: ${roundInfo[7]}`);
                    console.log(`  Total pool: ${roundInfo[6].toString()}`);
                    
                    if (roundInfo[7]) {
                        console.log(`  ⚠️  This round is already settled!`);
                    } else if (endTime > currentTime) {
                        console.log(`  ✅ This is a new active round`);
                    } else {
                        console.log(`  🚨 This round should be settled`);
                    }
                }
                
            } catch (error) {
                console.error(`Error checking ${market}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkNewRounds().catch(console.error);