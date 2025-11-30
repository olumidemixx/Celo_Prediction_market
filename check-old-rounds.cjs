const hre = require("hardhat");

async function checkOldRounds() {
    try {
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
        
        console.log('🔍 Checking Old Rounds After Settlement');
        
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];
        
        for (const market of markets) {
            console.log(`\n--- ${market} Market ---`);
            
            try {
                // Get round history
                const roundHistory = await marketManager.getRoundHistory(market);
                console.log(`Round history: ${roundHistory}`);
                
                if (roundHistory.length > 0) {
                    // Check the first round (should be the old one)
                    const oldRound = await hre.ethers.getContractAt('PredictionRound', roundHistory[0]);
                    const oldRoundInfo = await oldRound.getRoundInfo();
                    console.log(`Old round (${roundHistory[0]}):`);
                    console.log(`  Coin: ${oldRoundInfo[0]}`);
                    console.log(`  Strike price: ${oldRoundInfo[1].toString()}`);
                    console.log(`  Final price: ${oldRoundInfo[2].toString()}`);
                    console.log(`  Start time: ${oldRoundInfo[3].toString()}`);
                    console.log(`  End time: ${oldRoundInfo[5].toString()}`);
                    console.log(`  Total pool: ${oldRoundInfo[6].toString()}`);
                    console.log(`  Settled: ${oldRoundInfo[8]}`);
                    console.log(`  Above wins: ${oldRoundInfo[9]}`);
                    console.log(`  Is draw: ${oldRoundInfo[10]}`);
                    
                    // Check if there are multiple rounds
                    if (roundHistory.length > 1) {
                        const newRound = await hre.ethers.getContractAt('PredictionRound', roundHistory[1]);
                        const newRoundInfo = await newRound.getRoundInfo();
                        console.log(`New round (${roundHistory[1]}):`);
                        console.log(`  Start time: ${newRoundInfo[3].toString()}`);
                        console.log(`  End time: ${newRoundInfo[5].toString()}`);
                        console.log(`  Settled: ${newRoundInfo[8]}`);
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

checkOldRounds().catch(console.error);