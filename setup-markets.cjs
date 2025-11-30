const hre = require("hardhat");

async function setupMarkets() {
    try {
        console.log('🔧 Setting Up Markets');
        console.log('='.repeat(60));

        // The MarketManager address from your deployment
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';

        console.log(`📍 MarketManager Address: ${marketManagerAddress}`);

        const marketManager = await hre.ethers.getContractAt('MarketManager', marketManagerAddress);

        // Feed IDs for RedStone oracle
        const feedIds = {
            BTC: "0x4254430000000000000000000000000000000000000000000000000000000000",
            ETH: "0x4554480000000000000000000000000000000000000000000000000000000000",
            SOL: "0x534f4c0000000000000000000000000000000000000000000000000000000000",
            BNB: "0x424e420000000000000000000000000000000000000000000000000000000000"
        };

        console.log('\n📝 Initializing markets...\n');

        for (const [coin, feedId] of Object.entries(feedIds)) {
            try {
                console.log(`--- ${coin} Market ---`);

                // Try to get market info first
                try {
                    const marketInfo = await marketManager.getMarketInfo(coin);
                    if (marketInfo.initialized) {
                        console.log(`✅ ${coin} market already initialized`);
                        console.log(`   Current round: ${marketInfo.currentRound}`);
                        continue;
                    }
                } catch (error) {
                    // Market not initialized, proceed to initialize
                    console.log(`   Market not initialized yet, initializing...`);
                }

                // Initialize the market
                const tx = await marketManager.initializeMarket(coin, feedId);
                console.log(`📋 Transaction hash: ${tx.hash}`);

                const receipt = await tx.wait();
                console.log(`✅ ${coin} market initialized in block ${receipt.blockNumber}`);

            } catch (error) {
                console.error(`❌ Error with ${coin}: ${error.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Market Setup Complete!');
        console.log('='.repeat(60));
        console.log('\n📝 Next Steps:');
        console.log('1. Run: node initialize-markets.cjs (to create initial rounds)');
        console.log('2. Run: node auto-settle-service.cjs (to start auto-settlement)');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1);
    }
}

setupMarkets().catch(console.error);
