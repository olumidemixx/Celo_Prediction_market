const hre = require("hardhat");
require("dotenv").config();

// CONFIGURATION
const MARKET_MANAGER_ADDRESS = "0x40026B1E50B6105f29b2E2dA59FBE3ef0A79D4cD";
const BATCH_CREATOR_ADDRESS = "0x5d79005c7272f1F3114bFf79597dA5ECc558dBe2";
const MARKETS = ["BTC", "ETH", "SOL", "BNB"];
const CHECK_INTERVAL = 10000; // Check every 10 seconds for tighter synchronization
const NETWORK = "celoSepolia";

async function main() {
  console.log("🔄 Starting Synchronized Auto-Settlement Service...");
  console.log(`📍 Market Manager: ${MARKET_MANAGER_ADDRESS}`);
  console.log(`📍 Batch Creator: ${BATCH_CREATOR_ADDRESS}`);
  console.log("=".repeat(60));

  const [signer] = await hre.ethers.getSigners();
  console.log(`🔑 Operator: ${signer.address}`);

  const marketManager = await hre.ethers.getContractAt("MarketManager", MARKET_MANAGER_ADDRESS);
  const batchCreator = await hre.ethers.getContractAt("BatchRoundCreator", BATCH_CREATOR_ADDRESS);

  console.log("✅ Service initialized");
  console.log(`⏰ Checking markets every ${CHECK_INTERVAL / 1000} seconds...`);
  console.log("=".repeat(60));

  async function checkAndManageRounds() {
    const timestamp = new Date().toLocaleString();
    console.log(`\n🔍 [${timestamp}] Checking market status...`);

    let readyMarkets = 0;
    const marketsToSettle = [];

    // 1. Check status of all markets
    for (const market of MARKETS) {
      try {
        const marketInfo = await marketManager.getMarketInfo(market);
        const currentRound = marketInfo.currentRound;

        if (currentRound === '0x0000000000000000000000000000000000000000') {
          console.log(`   ${market}: Ready (No active round)`);
          readyMarkets++;
          continue;
        }

        const round = await hre.ethers.getContractAt("PredictionRound", currentRound);
        const roundInfo = await round.getRoundInfo();

        const endTime = Number(roundInfo[5]);
        const settled = roundInfo[7];
        const now = Math.floor(Date.now() / 1000);

        if (now >= endTime) {
          if (!settled) {
            console.log(`   ${market}: Expired - Needs settlement`);
            marketsToSettle.push({ market, round, type: 'settle' });
          } else {
            console.log(`   ${market}: Settled - Needs clearing`);
            marketsToSettle.push({ market, round, type: 'clear' });
          }
        } else {
          const timeRemaining = endTime - now;
          console.log(`   ${market}: Active (${timeRemaining}s remaining)`);
        }

      } catch (error) {
        console.error(`❌ ${market}: Error checking status - ${error.message}`);
      }
    }

    // 2. Settle/Clear expired markets to make them ready
    for (const item of marketsToSettle) {
      try {
        if (item.type === 'settle') {
          console.log(`⚡ ${item.market}: Settling...`);
          // We only settle here, we don't create next. We want to clear it next.
          // But wait, settleAndCreateNext does both.
          // We should use settle() on the round directly if possible, or use a new method on MarketManager if it exists.
          // MarketManager has settleAndCreateNext which we DON'T want to use if we want to sync.
          // MarketManager doesn't seem to have a simple "settle" function that doesn't create next?
          // Wait, PredictionRound has settle(). Anyone can call it.
          // So we can call round.settle().

          const tx = await item.round.settle();
          await tx.wait();
          console.log(`✅ ${item.market}: Settled`);

          // After settling, we need to clear it from MarketManager so it sees it as "No active round"
          // MarketManager.clearSettledRound() does this.
          console.log(`🧹 ${item.market}: Clearing...`);
          const clearTx = await marketManager.clearSettledRound(item.market);
          await clearTx.wait();
          console.log(`✅ ${item.market}: Cleared`);
          readyMarkets++;

        } else if (item.type === 'clear') {
          console.log(`🧹 ${item.market}: Clearing...`);
          const clearTx = await marketManager.clearSettledRound(item.market);
          await clearTx.wait();
          console.log(`✅ ${item.market}: Cleared`);
          readyMarkets++;
        }
      } catch (error) {
        console.error(`❌ ${item.market}: Failed to process - ${error.message}`);
      }
    }

    // 3. If ALL markets are ready, create batch
    if (readyMarkets === MARKETS.length) {
      console.log(`\n✨ All markets ready! Creating new batch...`);
      try {
        const tx = await batchCreator.createBatchRounds(MARKETS);
        console.log(`⏳ Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Batch creation confirmed in block ${receipt.blockNumber}`);

        // Verify start times
        console.log("   Verifying synchronization...");
        const firstMarket = MARKETS[0];
        const info = await marketManager.getMarketInfo(firstMarket);
        const r = await hre.ethers.getContractAt("PredictionRound", info.currentRound);
        const rInfo = await r.getRoundInfo();
        console.log(`   Batch Start Time: ${new Date(Number(rInfo[3]) * 1000).toLocaleString()}`);

      } catch (error) {
        console.error(`❌ Failed to create batch: ${error.message}`);
      }
    } else {
      console.log(`\n⏳ Waiting for synchronization (${readyMarkets}/${MARKETS.length} ready)...`);
    }
  }

  // Initial check
  await checkAndManageRounds();

  // Set up interval
  setInterval(checkAndManageRounds, CHECK_INTERVAL);

  console.log("\n" + "=".repeat(60));
  console.log("🚀 Synchronized Auto-Settlement Service is running...");
  console.log("Press Ctrl+C to stop");
  console.log("=".repeat(60));
}

main()
  .then(() => {
    process.stdin.resume();
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });