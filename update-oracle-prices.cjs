const hre = require("hardhat");
const https = require("https");

// CONFIGURATION
const ORACLE_ADDRESS = "0x3841f920A0Ee56Bb75e7D5150ca31Bd641979d1a";
const UPDATE_INTERVAL = 30000; // Update every 30 seconds (CoinGecko free tier rate limit)
const NETWORK = "celoSepolia";

// CoinGecko API for free real-time prices
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd";

// Cache for last valid prices (fallback when API fails)
let lastValidPrices = {
    BTC: 0,
    ETH: 0,
    SOL: 0,
    BNB: 0
};

async function fetchCryptoPrices() {
    return new Promise((resolve, reject) => {
        https.get(COINGECKO_API, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const prices = JSON.parse(data);
                    resolve({
                        BTC: prices.bitcoin?.usd || 0,
                        ETH: prices.ethereum?.usd || 0,
                        SOL: prices.solana?.usd || 0,
                        BNB: prices.binancecoin?.usd || 0
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

async function updateOraclePrices() {
    try {
        console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Fetching crypto prices...`);

        // Fetch real prices from CoinGecko
        const prices = await fetchCryptoPrices();

        console.log('📊 Current Prices:');
        console.log(`   BTC: $${prices.BTC.toLocaleString()}`);
        console.log(`   ETH: $${prices.ETH.toLocaleString()}`);
        console.log(`   SOL: $${prices.SOL.toLocaleString()}`);
        console.log(`   BNB: $${prices.BNB.toLocaleString()}`);

        // Check if all prices are zero (API rate limit or error)
        const allZero = prices.BTC === 0 && prices.ETH === 0 && prices.SOL === 0 && prices.BNB === 0;

        if (allZero) {
            console.log('⚠️  API returned $0 for all prices (likely rate limited)');

            // Check if we have valid cached prices
            const hasCachedPrices = lastValidPrices.BTC > 0 && lastValidPrices.ETH > 0 &&
                lastValidPrices.SOL > 0 && lastValidPrices.BNB > 0;

            if (hasCachedPrices) {
                console.log('💾 Using last valid cached prices:');
                console.log(`   BTC: $${lastValidPrices.BTC.toLocaleString()}`);
                console.log(`   ETH: $${lastValidPrices.ETH.toLocaleString()}`);
                console.log(`   SOL: $${lastValidPrices.SOL.toLocaleString()}`);
                console.log(`   BNB: $${lastValidPrices.BNB.toLocaleString()}`);

                // Use cached prices
                prices.BTC = lastValidPrices.BTC;
                prices.ETH = lastValidPrices.ETH;
                prices.SOL = lastValidPrices.SOL;
                prices.BNB = lastValidPrices.BNB;
            } else {
                console.log('❌ No cached prices available, skipping update');
                return;
            }
        } else {
            // Update cache with new valid prices
            lastValidPrices = { ...prices };
        }

        // Get oracle contract
        const oracle = await hre.ethers.getContractAt('MultiAssetOracle', ORACLE_ADDRESS);

        // Prepare data for batch update
        const symbols = ["BTC", "ETH", "SOL", "BNB"];
        const priceValues = [
            hre.ethers.parseUnits(prices.BTC.toString(), 8),
            hre.ethers.parseUnits(prices.ETH.toString(), 8),
            hre.ethers.parseUnits(prices.SOL.toString(), 8),
            hre.ethers.parseUnits(prices.BNB.toString(), 8)
        ];

        console.log(`\n📝 Updating oracle with new prices...`);

        // Update the oracle
        const tx = await oracle.setPrices(symbols, priceValues);
        await tx.wait();

        console.log(`✅ Oracle updated successfully (tx: ${tx.hash.slice(0, 10)}...)`);

        // Verify the update
        console.log('🔍 Verifying updates:');
        for (const symbol of symbols) {
            const newPrice = await oracle.read(symbol);
            const formattedPrice = hre.ethers.formatUnits(newPrice, 8);
            console.log(`   ${symbol}: $${formattedPrice}`);
        }

    } catch (error) {
        console.error(`❌ Error updating oracle:`, error.message);
    }
}

async function main() {
    console.log('🚀 Starting Multi-Asset Oracle Price Updater Service');
    console.log('='.repeat(60));
    console.log(`📍 Oracle Address: ${ORACLE_ADDRESS}`);
    console.log(`📍 Network: ${NETWORK}`);
    console.log(`⏰ Update Interval: ${UPDATE_INTERVAL / 1000} seconds`);
    console.log('='.repeat(60));

    const [signer] = await hre.ethers.getSigners();
    console.log(`🔑 Operator: ${signer.address}`);
    console.log('='.repeat(60));

    // Initial update
    await updateOraclePrices();

    // Set up periodic updates
    setInterval(updateOraclePrices, UPDATE_INTERVAL);

    console.log('\n' + '='.repeat(60));
    console.log('🚀 Oracle price updater is running...');
    console.log('💡 Tip: Run this alongside auto-settle-service.cjs');
    console.log('Press Ctrl+C to stop');
    console.log('='.repeat(60));
}

main()
    .then(() => {
        process.stdin.resume();
    })
    .catch((error) => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
