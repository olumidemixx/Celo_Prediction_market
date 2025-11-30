const hre = require("hardhat");

async function checkMarkets() {
    try {
        const marketManagerAddress = '0x5220B9bfA9d9e6Ace1D0917dA9BfA6e50baCc888';

        console.log('Connecting to MarketManager at:', marketManagerAddress);
        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);

        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];

        console.log('\n=== Checking Market Status ===');
        for (const market of markets) {
            console.log(`\n--- ${market} Market ---`);

            try {
                // Check market info
                const marketInfo = await marketManager.getMarketInfo(market);
                console.log(`Market Info:`, {
                    feedId: marketInfo.feedId,
                    currentRound: marketInfo.currentRound,
                    roundCount: marketInfo.roundCount.toString(),
                    initialized: marketInfo.initialized,
                    paused: marketInfo.paused
                });

                // Check current round
                const currentRound = await marketManager.getCurrentRound(market);
                console.log(`Current Round:`, currentRound);

                if (currentRound !== '0x0000000000000000000000000000000000000000') {
                    // Get round info
                    const round = await hre.ethers.getContractAt('PredictionRound', currentRound);
                    const roundInfo = await round.getRoundInfo();
                    console.log(`Round Info:`, {
                        coin: roundInfo[0],
                        strikePrice: roundInfo[1].toString(),
                        finalPrice: roundInfo[2].toString(),
                        startTime: roundInfo[3].toString(),
                        entryDeadline: roundInfo[4].toString(),
                        endTime: roundInfo[5].toString(),
                        totalPool: roundInfo[6].toString(),
                        settled: roundInfo[7],
                        aboveWins: roundInfo[8],
                        isDraw: roundInfo[9]
                    });
                }

            } catch (error) {
                console.error(`Error checking ${market}:`, error.message);
            }
        }

        console.log('\n=== Checking All Markets ===');
        const allMarkets = await marketManager.getAllMarkets();
        console.log('All initialized markets:', allMarkets);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkMarkets().catch(console.error);