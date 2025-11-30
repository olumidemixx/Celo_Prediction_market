const hre = require("hardhat");
require("dotenv").config();

// Market Manager address
const MARKET_MANAGER_ADDRESS = "0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55";

// Markets to monitor
const MARKETS = ["BTC", "ETH", "SOL", "BNB"];

// Auto-settle interval (in milliseconds) - Check every 30 seconds
const SETTLE_INTERVAL = 30000;

async function main() {
  console.log("🔄 Starting Auto-Settlement Service...");
  console.log(`📍 Market Manager: ${MARKET_MANAGER_ADDRESS}`);
  
  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`🔑 Operator: ${signer.address}`);
  
  // Connect to MarketManager
  const MarketManager = await hre.ethers.getContractFactory("MarketManager");
  const marketManager = MarketManager.attach(MARKET_MANAGER_ADDRESS);
  
  console.log("✅ Auto-settlement service initialized");
  console.log(`⏰ Checking for expired rounds every ${SETTLE_INTERVAL/1000} seconds...`);
  
  // Function to check and settle expired rounds
  async function checkAndSettleRounds() {
    try {
      console.log(`\n🔍 Checking for expired rounds at ${new Date().toISOString()}...`);
      
      // Check all markets for expired rounds
      for (const coin of MARKETS) {
        try {
          const marketInfo = await marketManager.getMarketInfo(coin);
          
          if (marketInfo.currentRound !== hre.ethers.ZeroAddress) {
            const currentRound = await hre.ethers.getContractAt("PredictionRound", marketInfo.currentRound);
            const endTime = await currentRound.endTime();
            const settled = await currentRound.settled();
            const currentTime = Math.floor(Date.now() / 1000);
            
            console.log(`${coin}: Round ends at ${new Date(Number(endTime) * 1000).toISOString()}, Current time: ${new Date(currentTime * 1000).toISOString()}, Settled: ${settled}`);
            
            if (currentTime >= Number(endTime) && !settled) {
              console.log(`🎯 ${coin} round is ready to settle!`);
            }
          }
        } catch (error) {
          console.error(`❌ Error checking ${coin}: ${error.message}`);
        }
      }
      
      // Call settleAllExpiredRounds
      const tx = await marketManager.settleAllExpiredRounds();
      console.log(`📤 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Check if any rounds were settled
      const events = receipt.logs.filter(log => log.fragment?.name === "RoundSettled");
      if (events.length > 0) {
        console.log(`🎉 Settled ${events.length} rounds:`);
        events.forEach(event => {
          console.log(`   - ${event.args.coin}: ${event.args.roundAddress}`);
        });
      } else {
        console.log("⏳ No rounds needed settlement");
      }
      
    } catch (error) {
      console.error(`❌ Error during settlement: ${error.message}`);
    }
  }
  
  // Initial check
  await checkAndSettleRounds();
  
  // Set up interval for periodic checks
  setInterval(checkAndSettleRounds, SETTLE_INTERVAL);
  
  // Keep the process running
  console.log("\n🚀 Auto-settlement service is running...");
  console.log("Press Ctrl+C to stop\n");
}

main()
  .then(() => {
    // Keep the process alive
    process.stdin.resume();
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });