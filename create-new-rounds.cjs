const hre = require("hardhat");

async function createNewRounds() {
    try {
        console.log('🔄 Creating New Rounds After Settlement');
        
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
                
                // Check if current round is settled
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
                        console.log('🔄 Creating new round...');
                        
                        // Create new round
                        const tx = await marketManager.createRound(market);
                        console.log('📋 Transaction hash:', tx.hash);
                        
                        const receipt = await tx.wait();
                        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
                        
                        // Check new state
                        const newMarketInfo = await marketManager.getMarketInfo(market);
                        console.log(`New current round: ${newMarketInfo.currentRound}`);
                        console.log(`New round count: ${newMarketInfo.roundCount.toString()}`);
                        
                        if (newMarketInfo.currentRound !== '0x0000000000000000000000000000000000000000') {
                            const newRound = await hre.ethers.getContractAt('PredictionRound', newMarketInfo.currentRound);
                            const newRoundInfo = await newRound.getRoundInfo();
                            
                            console.log(`New round start time: ${newRoundInfo[3].toString()}`);
                            console.log(`New round end time: ${newRoundInfo[5].toString()}`);
                            console.log(`New round settled: ${newRoundInfo[7]}`);
                        }
                    } else {
                        console.log('⚠️  Round not ready for new creation');
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
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createNewRounds().catch(console.error);