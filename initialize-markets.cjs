const hre = require("hardhat");

// CONFIGURATION - Update these values
const MARKET_MANAGER_ADDRESS = "0x5220B9bfA9d9e6Ace1D0917dA9BfA6e50baCc888"; // Your deployed MarketManager address
const NETWORK = "celoSepolia"; // or "hardhat" for local

async function initializeRoundsOnTestnet() {
    try {
        console.log('🚀 Initializing Rounds on Testnet');
        console.log('='.repeat(60));
        console.log(`📍 Network: ${NETWORK}`);
        console.log(`📍 MarketManager: ${MARKET_MANAGER_ADDRESS}`);
        console.log('='.repeat(60));

        const marketManager = await hre.ethers.getContractAt('MarketManager', MARKET_MANAGER_ADDRESS);
        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];

        for (const market of markets) {
            console.log(`\n--- ${market} Market ---`);

            try {
                // Check current state
                const marketInfo = await marketManager.getMarketInfo(market);
                const currentRound = marketInfo.currentRound;
                const initialized = marketInfo.initialized;

                console.log(`Initialized: ${initialized}`);
                console.log(`Current round: ${currentRound}`);

                if (!initialized) {
                    console.log(`⚠️  Market not initialized. Run setup-markets.cjs first.`);
                    continue;
                }

                // Check if there's already an active round
                if (currentRound === '0x0000000000000000000000000000000000000000') {
                    console.log('📝 No active round. Creating new round...');

                    const tx = await marketManager.createRound(market);
                    console.log('📋 Transaction hash:', tx.hash);

                    const receipt = await tx.wait();
                    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

                    // Get the new round info
                    const newMarketInfo = await marketManager.getMarketInfo(market);
                    const newRoundAddress = newMarketInfo.currentRound;
                    console.log(`✅ New round created at: ${newRoundAddress}`);

                    // Get round details
                    const round = await hre.ethers.getContractAt('PredictionRound', newRoundAddress);
                    const roundInfo = await round.getRoundInfo();

                    const startTime = Number(roundInfo[3]);
                    const entryDeadline = Number(roundInfo[4]);
                    const endTime = Number(roundInfo[5]);
                    const strikePrice = roundInfo[1];

                    const now = Math.floor(Date.now() / 1000);
                    console.log(`   Strike Price: $${hre.ethers.formatUnits(strikePrice, 8)}`);
                    console.log(`   Entry ends in: ${entryDeadline - now}s`);
                    console.log(`   Round ends in: ${endTime - now}s`);
                } else {
                    console.log('✅ Active round exists');

                    // Get round details
                    const round = await hre.ethers.getContractAt('PredictionRound', currentRound);
                    const roundInfo = await round.getRoundInfo();

                    const settled = roundInfo[7];
                    const endTime = Number(roundInfo[5]);
                    const now = Math.floor(Date.now() / 1000);

                    if (settled) {
                        console.log('⚠️  Round is settled. Clearing and creating new...');

                        const clearTx = await marketManager.clearSettledRound(market);
                        await clearTx.wait();
                        console.log('✅ Cleared settled round');

                        const createTx = await marketManager.createRound(market);
                        await createTx.wait();
                        console.log('✅ New round created');
                    } else if (now >= endTime) {
                        console.log('⚠️  Round ended but not settled. Use auto-settle service.');
                    } else {
                        console.log(`   Time until end: ${endTime - now}s`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error with ${market}:`, error.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Initialization Complete!');
        console.log('='.repeat(60));
        console.log('\n📝 Next Steps:');
        console.log('1. Check frontend - all markets should show active rounds');
        console.log('2. Start auto-settle service:');
        console.log(`   npx hardhat run auto-settle-service.cjs --network ${NETWORK}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        console.error(error);
        process.exit(1);
    }
}

initializeRoundsOnTestnet().catch(console.error);
