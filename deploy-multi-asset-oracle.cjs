const hre = require("hardhat");
const https = require("https");

// CoinGecko API for real-time prices
const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin&vs_currencies=usd";

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

async function main() {
    console.log('🚀 Deploying MultiAssetOracle...');
    console.log('='.repeat(60));

    const [deployer] = await hre.ethers.getSigners();
    console.log(`📍 Deploying from: ${deployer.address}`);

    // Fetch current crypto prices
    console.log('\n📊 Fetching current crypto prices...');
    const prices = await fetchCryptoPrices();

    console.log('Current Prices:');
    console.log(`   BTC: $${prices.BTC.toLocaleString()}`);
    console.log(`   ETH: $${prices.ETH.toLocaleString()}`);
    console.log(`   SOL: $${prices.SOL.toLocaleString()}`);
    console.log(`   BNB: $${prices.BNB.toLocaleString()}`);

    // Deploy MultiAssetOracle
    console.log('\n📝 Deploying MultiAssetOracle contract...');
    const MultiAssetOracle = await hre.ethers.getContractFactory("MultiAssetOracle");
    const oracle = await MultiAssetOracle.deploy();
    await oracle.waitForDeployment();

    const oracleAddress = await oracle.getAddress();
    console.log(`✅ MultiAssetOracle deployed to: ${oracleAddress}`);

    // Set initial prices
    console.log('\n💰 Setting initial prices...');
    const symbols = ["BTC", "ETH", "SOL", "BNB"];
    const pricesInOracle = [
        hre.ethers.parseUnits(prices.BTC.toString(), 8),
        hre.ethers.parseUnits(prices.ETH.toString(), 8),
        hre.ethers.parseUnits(prices.SOL.toString(), 8),
        hre.ethers.parseUnits(prices.BNB.toString(), 8)
    ];

    const tx = await oracle.setPrices(symbols, pricesInOracle);
    await tx.wait();
    console.log('✅ Initial prices set successfully');

    // Verify prices
    console.log('\n🔍 Verifying prices...');
    for (const symbol of symbols) {
        const price = await oracle.read(symbol);
        const formattedPrice = hre.ethers.formatUnits(price, 8);
        console.log(`   ${symbol}: $${parseFloat(formattedPrice).toLocaleString()}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Deployment Complete!');
    console.log('='.repeat(60));
    console.log('\n📝 Next Steps:');
    console.log('1. Update REDSTONE_ORACLE address in PredictionRound.sol:');
    console.log(`   address public constant REDSTONE_ORACLE = ${oracleAddress};`);
    console.log('\n2. Recompile contracts:');
    console.log('   npx hardhat compile');
    console.log('\n3. Redeploy the system:');
    console.log('   npx hardhat run scripts/deploy.js --network celoSepolia');
    console.log('\n4. Update oracle address in update-oracle-prices.cjs');
    console.log('='.repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
