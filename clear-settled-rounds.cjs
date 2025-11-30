const hre = require("hardhat");

async function clearSettledRounds() {
    try {
        console.log('🔧 Clearing Settled Round References');
        
        const marketManagerAddress = '0x8E7Ef2c7704C0b5DDDd788bFda588539C64098a3';
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];
        
        for (const market of markets) {
            console.log(`\n--- ${market} Market ---`);
            
            try {
                // Check current state
                const marketInfo = await marketManager.getMarketInfo(market);
                console.log(`Current round: ${marketInfo.currentRound}`);
                console.log(`Round count: ${marketInfo.roundCount.toString()}`);
                
                if (marketInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
                    const round = await hre.ethers.getContractAt('PredictionRound', marketInfo.currentRound);
                    const roundInfo = await round.getRoundInfo();
                    const isSettled = roundInfo[7];
                    const endTime = roundInfo[5].toString();
                    const currentTime = Math.floor(Date.now()/1000);
                    
                    console.log(`Current round end time: ${endTime}`);
                    console.log(`Current time: ${currentTime}`);
                    console.log(`Seconds past end: ${currentTime - endTime}`);
                    console.log(`Is settled: ${isSettled}`);
                    
                    if (isSettled && endTime < currentTime) {
                        console.log('🔄 Clearing settled round reference...');
                        
                        // Clear the settled round
                        const tx = await marketManager.clearSettledRound(market);
                        console.log('📋 Transaction hash:', tx.hash);
                        
                        const receipt = await tx.wait();
                        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
                        
                        // Check if current round was cleared
                        const newMarketInfo = await marketManager.getMarketInfo(market);
                        console.log(`After clearing - Current round: ${newMarketInfo.currentRound}`);
                        
                        if (newMarketInfo.currentRound === '0x0000000000000000000000000000000000000000') {
                            console.log('🎉 Current round cleared! Creating new round...');
                            
                            // Create new round
                            const createTx = await marketManager.createRound(market);
                            console.log('📋 Create transaction hash:', createTx.hash);
                            
                            const createReceipt = await createTx.wait();
                            console.log('✅ Create transaction confirmed in block:', createReceipt.blockNumber);
                            
                            // Check final state
                            const finalMarketInfo = await marketManager.getMarketInfo(market);
                            console.log(`Final - Current round: ${finalMarketInfo.currentRound}`);
                            console.log(`Final - Round count: ${finalMarketInfo.roundCount.toString()}`);
                            
                            if (finalMarketInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
                                const newRound = await hre.ethers.getContractAt('PredictionRound', finalMarketInfo.currentRound);
                                const newRoundInfo = await newRound.getRoundInfo();
                                
                                console.log(`New round start time: ${newRoundInfo[3].toString()}`);
                                console.log(`New round end time: ${newRoundInfo[5].toString()}`);
                                console.log(`New round settled: ${newRoundInfo[7]}`);
                                console.log(`New round total pool: ${newRoundInfo[6].toString()}`);
                            }
                        }
                    } else {
                        console.log('⚠️  Round not ready for clearing');
                    }
                } else {
                    console.log('🔄 No current round, creating new one...');
                    
                    const tx = await marketManager.createRound(market);
                    console.log('📋 Transaction hash:', tx.hash);
                    
                    const receipt = await tx.wait();
                    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
                }
                
            } catch (error) {
                console.error(`Error with ${market}:`, error.message);
            }
        }
        
        console.log('\n🎉 All markets should now have active rounds!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

clearSettledRounds().catch(console.error);