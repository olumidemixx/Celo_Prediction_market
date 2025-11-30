const hre = require("hardhat");

async function checkOraclePrices() {
    const ORACLE_ADDRESS = "0x3841f920A0Ee56Bb75e7D5150ca31Bd641979d1a";
    console.log(`Checking MultiAssetOracle at ${ORACLE_ADDRESS}`);

    const oracle = await hre.ethers.getContractAt('MultiAssetOracle', ORACLE_ADDRESS);

    const symbols = ["BTC", "ETH", "SOL", "BNB"];

    for (const symbol of symbols) {
        try {
            const price = await oracle.read(symbol);
            console.log(`${symbol}: $${hre.ethers.formatUnits(price, 8)}`);
        } catch (error) {
            console.log(`${symbol}: Error - ${error.message}`);
        }
    }
}

checkOraclePrices().catch(console.error);
