const hre = require("hardhat");

async function checkOracle() {
    console.log('🔍 Checking Oracle Status');
    console.log('='.repeat(60));

    // The oracle addresses to check
    const oracleAddresses = {
        'Contract Oracle': '0x53a4024eE5A83ABD109119dD687244b3a4d9C7F3',
        'Frontend Oracle': '0xeBDf5a33d34356A1cD336efF178Ef661085ca6ef'
    };

    for (const [name, address] of Object.entries(oracleAddresses)) {
        console.log(`\n--- ${name}: ${address} ---`);

        try {
            // Try to call read() function
            const oracle = await hre.ethers.getContractAt('MockOracle', address);
            const price = await oracle.read();

            console.log(`✅ Oracle is accessible`);
            console.log(`   Current price: ${price.toString()}`);
            console.log(`   Formatted (8 decimals): $${hre.ethers.formatUnits(price, 8)}`);

        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 Analysis:');
    console.log('The oracle is returning a fixed mock price.');
    console.log('For real-time prices, we need to either:');
    console.log('1. Deploy a proper RedStone oracle integration');
    console.log('2. Update the MockOracle with real prices periodically');
    console.log('3. Use RedStone pull-based oracle model');
    console.log('='.repeat(60));
}

checkOracle().catch(console.error);
