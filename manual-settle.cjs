const hre = require("hardhat");
require("dotenv").config();

const MARKET_MANAGER_ADDRESS = "0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55";

async function main() {
  console.log("🔄 Manual Settlement Script");
  
  const [signer] = await hre.ethers.getSigners();
  console.log(`🔑 Operator: ${signer.address}`);
  
  const MarketManager = await hre.ethers.getContractFactory("MarketManager");
  const marketManager = MarketManager.attach(MARKET_MANAGER_ADDRESS);
  
  console.log("📤 Calling settleAllExpiredRounds...");
  const tx = await marketManager.settleAllExpiredRounds();
  console.log(`📋 Transaction hash: ${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  
  console.log("🎉 Settlement complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });