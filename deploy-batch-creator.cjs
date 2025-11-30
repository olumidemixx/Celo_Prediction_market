const hre = require("hardhat");

async function main() {
  const MARKET_MANAGER_ADDRESS = "0x40026B1E50B6105f29b2E2dA59FBE3ef0A79D4cD";

  console.log("Deploying BatchRoundCreator...");
  const BatchRoundCreator = await hre.ethers.getContractFactory("BatchRoundCreator");
  const batchRoundCreator = await BatchRoundCreator.deploy(MARKET_MANAGER_ADDRESS);

  await batchRoundCreator.waitForDeployment();

  const address = await batchRoundCreator.getAddress();
  console.log(`BatchRoundCreator deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
