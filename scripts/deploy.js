import hre from 'hardhat';

async function main() {
    const signers = await hre.ethers.getSigners();
    const deployer = signers[0];

    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "CELO");

    // Deploy PredictionRound implementation
    console.log("\n1. Deploying PredictionRound implementation...");
    const PredictionRound = await hre.ethers.getContractFactory("PredictionRound");
    const predictionRound = await PredictionRound.deploy();
    await predictionRound.waitForDeployment();
    const roundAddress = await predictionRound.getAddress();

    console.log("✅ PredictionRound implementation deployed to:", roundAddress);

    // Deploy MarketManager
    console.log("\n2. Deploying MarketManager...");
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

    console.log("\n3. Initializing markets...");
    for (const [coin, feedId] of Object.entries(feedIds)) {
        const tx = await marketManager.initializeMarket(coin, feedId);
        await tx.wait();
        console.log(`✅ ${coin} market initialized`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log("\nContract Addresses:");
    console.log("PredictionRound Implementation:", roundAddress);
    console.log("MarketManager:", managerAddress);
    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend/.env.local with:");
    console.log(`   NEXT_PUBLIC_MARKET_MANAGER_ADDRESS=${managerAddress}`);
    console.log("2. Run: npm run generate-abi");
    console.log("3. Start frontend: cd frontend && npm run dev");
    console.log("=".repeat(60));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
