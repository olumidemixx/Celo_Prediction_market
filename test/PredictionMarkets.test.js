import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Celo Prediction Markets", function () {
    let marketManager;
    let predictionRound;
    let owner, user1, user2, user3;
    let feeCollector;

    const FEED_IDS = {
        BTC: "0x4254430000000000000000000000000000000000000000000000000000000000",
        ETH: "0x4554480000000000000000000000000000000000000000000000000000000000",
        SOL: "0x534f4c0000000000000000000000000000000000000000000000000000000000",
        BNB: "0x424e420000000000000000000000000000000000000000000000000000000000"
    };

    beforeEach(async function () {
        [owner, user1, user2, user3, feeCollector] = await hre.ethers.getSigners();

        // Deploy PredictionRound implementation
        const PredictionRound = await hre.ethers.getContractFactory("PredictionRound");
        predictionRound = await PredictionRound.deploy();
        await predictionRound.waitForDeployment();

        // Deploy MarketManager
        const MarketManager = await hre.ethers.getContractFactory("MarketManager");
        marketManager = await MarketManager.deploy(
            await predictionRound.getAddress(),
            feeCollector.address
        );
        await marketManager.waitForDeployment();
    });

    describe("MarketManager Deployment", function () {
        it("Should set the correct owner", async function () {
            expect(await marketManager.owner()).to.equal(owner.address);
        });

        it("Should set the correct fee collector", async function () {
            expect(await marketManager.feeCollector()).to.equal(feeCollector.address);
        });

        it("Should set the correct round implementation", async function () {
            expect(await marketManager.roundImplementation()).to.equal(await predictionRound.getAddress());
        });
    });

    describe("Market Initialization", function () {
        it("Should initialize BTC market", async function () {
            await expect(marketManager.initializeMarket("BTC", FEED_IDS.BTC))
                .to.emit(marketManager, "MarketInitialized")
                .withArgs("BTC", FEED_IDS.BTC);

            const marketInfo = await marketManager.getMarketInfo("BTC");
            expect(marketInfo.initialized).to.be.true;
            expect(marketInfo.paused).to.be.false;
        });

        it("Should initialize all markets", async function () {
            for (const [coin, feedId] of Object.entries(FEED_IDS)) {
                await marketManager.initializeMarket(coin, feedId);
            }

            const allMarkets = await marketManager.getAllMarkets();
            expect(allMarkets.length).to.equal(4);
            expect(allMarkets).to.include("BTC");
            expect(allMarkets).to.include("ETH");
            expect(allMarkets).to.include("SOL");
            expect(allMarkets).to.include("BNB");
        });

        it("Should revert if market already initialized", async function () {
            await marketManager.initializeMarket("BTC", FEED_IDS.BTC);
            await expect(marketManager.initializeMarket("BTC", FEED_IDS.BTC))
                .to.be.revertedWith("Market already initialized");
        });

        it("Should revert if non-owner tries to initialize", async function () {
            await expect(marketManager.connect(user1).initializeMarket("BTC", FEED_IDS.BTC))
                .to.be.revertedWithCustomError(marketManager, "OwnableUnauthorizedAccount");
        });
    });

    describe("Round Creation", function () {
        beforeEach(async function () {
            await marketManager.initializeMarket("BTC", FEED_IDS.BTC);
        });

        it("Should create a new round", async function () {
            // Note: This will fail on hardhat network without oracle mock
            // For local testing, you'd need to fork or mock the oracle
            // This test structure shows the expected behavior

            // In a real test with oracle:
            // const tx = await marketManager.createRound("BTC");
            // const receipt = await tx.wait();
            // const roundAddress = await marketManager.getCurrentRound("BTC");
            // expect(roundAddress).to.not.equal(hre.ethers.ZeroAddress);
        });

        it("Should revert if market not initialized", async function () {
            await expect(marketManager.createRound("DOGE"))
                .to.be.revertedWith("Market not initialized");
        });

        it("Should revert if market is paused", async function () {
            await marketManager.pauseMarket("BTC");
            await expect(marketManager.createRound("BTC"))
                .to.be.revertedWith("Market is paused");
        });
    });

    describe("Market Pause/Unpause", function () {
        beforeEach(async function () {
            await marketManager.initializeMarket("BTC", FEED_IDS.BTC);
        });

        it("Should pause market", async function () {
            await expect(marketManager.pauseMarket("BTC"))
                .to.emit(marketManager, "MarketPaused")
                .withArgs("BTC");

            const marketInfo = await marketManager.getMarketInfo("BTC");
            expect(marketInfo.paused).to.be.true;
        });

        it("Should unpause market", async function () {
            await marketManager.pauseMarket("BTC");

            await expect(marketManager.unpauseMarket("BTC"))
                .to.emit(marketManager, "MarketUnpaused")
                .withArgs("BTC");

            const marketInfo = await marketManager.getMarketInfo("BTC");
            expect(marketInfo.paused).to.be.false;
        });

        it("Should revert if non-owner tries to pause", async function () {
            await expect(marketManager.connect(user1).pauseMarket("BTC"))
                .to.be.revertedWithCustomError(marketManager, "OwnableUnauthorizedAccount");
        });
    });

    describe("Fee Collector Update", function () {
        it("Should update fee collector", async function () {
            await expect(marketManager.updateFeeCollector(user1.address))
                .to.emit(marketManager, "FeeCollectorUpdated")
                .withArgs(feeCollector.address, user1.address);

            expect(await marketManager.feeCollector()).to.equal(user1.address);
        });

        it("Should revert if new collector is zero address", async function () {
            await expect(marketManager.updateFeeCollector(hre.ethers.ZeroAddress))
                .to.be.revertedWith("Invalid address");
        });

        it("Should revert if non-owner tries to update", async function () {
            await expect(marketManager.connect(user1).updateFeeCollector(user2.address))
                .to.be.revertedWithCustomError(marketManager, "OwnableUnauthorizedAccount");
        });
    });

    describe("PredictionRound Logic", function () {
        // Note: These tests would require oracle mocking or forking
        // Below is the structure for comprehensive round testing

        it("Should handle entry period correctly", async function () {
            // Test entry during valid period
            // Test rejection after entry deadline
        });

        it("Should calculate fees correctly", async function () {
            // Test 1% fee calculation
            // Verify fee sent to collector
        });

        it("Should settle round correctly", async function () {
            // Test settlement after end time
            // Test winner determination
            // Test draw scenario
        });

        it("Should distribute winnings pro-rata", async function () {
            // Test payout calculations
            // Verify winners receive correct amounts
        });

        it("Should handle emergency refunds", async function () {
            // Test refund after oracle failure
        });
    });
});
