const hre = require("hardhat");

async function fixSettledRounds() {
    try {
        console.log('🔧 Fixing Settled Rounds - Clearing Current Round References');
        
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
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
                    
                    console.log(`Is settled: ${isSettled}`);
                    
                    if (isSettled) {
                        console.log('🔄 Round is settled, need to clear current round reference...');
                        
                        // I need to add a function to the MarketManager to clear settled rounds
                        // For now, let me check if I can call settleAndCreateNext with a different approach
                        
                        // Try to call settleAndCreateNext but catch the error and handle it
                        try {
                            console.log('🚀 Attempting settleAndCreateNext...');
                            const tx = await marketManager.settleAndCreateNext(market);
                            const receipt = await tx.wait();
                            console.log('✅ settleAndCreateNext succeeded');
                        } catch (error) {
                            if (error.message.includes('Already settled')) {
                                console.log('⚠️  Round already settled, need manual intervention');
                                
                                // For now, let me try a workaround: pause and unpause the market
                                // This might reset the current round
                                console.log('🔄 Trying pause/unpause workaround...');
                                
                                try {
                                    const pauseTx = await marketManager.pauseMarket(market);
                                    await pauseTx.wait();
                                    console.log('✅ Market paused');
                                    
                                    const unpauseTx = await marketManager.unpauseMarket(market);
                                    await unpauseTx.wait();
                                    console.log('✅ Market unpaused');
                                    
                                    // Check if current round was cleared
                                    const newMarketInfo = await marketManager.getMarketInfo(market);
                                    console.log(`After pause/unpause - Current round: ${newMarketInfo.currentRound}`);
                                    
                                    if (newMarketInfo.currentRound === '0x0000000000000000000000000000000000000000') {
                                        console.log('🎉 Current round cleared! Creating new round...');
                                        const createTx = await marketManager.createRound(market);
                                        await createTx.wait();
                                        console.log('✅ New round created!');
                                    }
                                } catch (pauseError) {
                                    console.log('❌ Pause/unpause failed:', pauseError.message);
                                }
                            } else {
                                throw error;
                            }
                        }
                    }
                }
                
            } catch (error) {
                console.error(`Error with ${market}:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

fixSettledRounds().catch(console.error);