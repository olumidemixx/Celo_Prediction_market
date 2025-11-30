const hre = require("hardhat");

const ORACLE_ADDRESS = "0x3841f920A0Ee56Bb75e7D5150ca31Bd641979d1a";

async function main() {
    console.log('🔍 Checking MultiAssetOracle...');
    console.log('='.repeat(60));
    console.log(`📍 Oracle Address: ${ORACLE_ADDRESS}`);

    const oracle = await hre.ethers.getContractAt("MultiAssetOracle", ORACLE_ADDRESS);

    const symbols = ["BTC", "ETH", "SOL", "BNB"];

    console.log('\n📊 Current Prices:');
    for (const symbol of symbols) {
        try {
            const price = await oracle.read(symbol);
            const formattedPrice = hre.ethers.formatUnits(price, 8);
            console.log(`   ${symbol}: $${parseFloat(formattedPrice).toLocaleString()}`);
        } catch (error) {
            console.log(`   ${symbol}: ❌ Not set - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
