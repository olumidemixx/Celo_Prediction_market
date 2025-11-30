const hre = require('hardhat');

async function main() {
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];

    console.log('🚀 Deploying Complete Prediction Market System');
    console.log('='.repeat(60));
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
    console.log('='.repeat(60));

    // Deploy PredictionRound implementation
    console.log("\n1️⃣  Deploying PredictionRound implementation...");
    const PredictionRound = await hre.ethers.getContractFactory("PredictionRound");
    const predictionRound = await PredictionRound.deploy();
    await predictionRound.waitForDeployment();
    const roundAddress = await predictionRound.getAddress();

    console.log("✅ PredictionRound implementation deployed to:", roundAddress);

    // Deploy MarketManager
    console.log("\n2️⃣  Deploying MarketManager...");
    const MarketManager = await hre.ethers.getContractFactory("MarketManager");
    const marketManager = await MarketManager.deploy(
        roundAddress,
        deployer.address  // Fee collector
    );
    await marketManager.waitForDeployment();
    const managerAddress = await marketManager.getAddress();

    console.log("✅ MarketManager deployed to:", managerAddress);

    // Initialize markets
    const feedIds = {
        BTC: "0x4254430000000000000000000000000000000000000000000000000000000000",
        ETH: "0x4554480000000000000000000000000000000000000000000000000000000000",
        SOL: "0x534f4c0000000000000000000000000000000000000000000000000000000000",
        BNB: "0x424e420000000000000000000000000000000000000000000000000000000000"
    };

    console.log("\n3️⃣  Initializing markets...");
    for (const [coin, feedId] of Object.entries(feedIds)) {
        const tx = await marketManager.initializeMarket(coin, feedId);
        await tx.wait();
        console.log(`✅ ${coin} market initialized`);
    }

    // Create initial rounds
    console.log("\n4️⃣  Creating initial rounds...");
    for (const coin of Object.keys(feedIds)) {
        try {
            const tx = await marketManager.createRound(coin);
            const receipt = await tx.wait();
            console.log(`✅ ${coin} round created`);

            // Get round info
            const marketInfo = await marketManager.getMarketInfo(coin);
            const round = await hre.ethers.getContractAt('PredictionRound', marketInfo.currentRound);
            const roundInfo = await round.getRoundInfo();
            const strikePrice = roundInfo[1];

            console.log(`   Strike Price: ${hre.ethers.formatUnits(strikePrice, 8)}`);
        } catch (error) {
            console.error(`❌ Error creating ${coin} round:`, error.message);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log("\n📝 Contract Addresses:");
    console.log("PredictionRound Implementation:", roundAddress);
    console.log("MarketManager:", managerAddress);
    console.log("\n📝 Next Steps:");
    console.log("1. Update scripts to use MarketManager address:", managerAddress);
    console.log("2. Update frontend/.env.local with:");
    console.log(`   NEXT_PUBLIC_MARKET_MANAGER_ADDRESS=${managerAddress}`);
    console.log("3. Start auto-settle service: node auto-settle-service.cjs");
    console.log("=".repeat(60));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
