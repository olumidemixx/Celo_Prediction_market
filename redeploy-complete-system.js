import pkg from 'hardhat';
const { ethers } = pkg;

async function redeployCompleteSystem() {
    try {
        console.log('Redeploying complete system with mock oracle...');
        
        // Get deployer
        const signers = await ethers.getSigners();
        const deployer = signers[0];
        console.log('Deployer address:', deployer.address);
        
        // Step 1: Deploy new PredictionRound implementation
        console.log('\nStep 1: Deploying PredictionRound implementation...');
        const PredictionRound = await ethers.getContractFactory('PredictionRound');
        const predictionRound = await PredictionRound.deploy();
        await predictionRound.waitForDeployment();
        const predictionRoundAddress = await predictionRound.getAddress();
        console.log('✅ PredictionRound deployed at:', predictionRoundAddress);
        
        // Step 2: Deploy new MarketManager
        console.log('\nStep 2: Deploying MarketManager...');
        const feeCollector = deployer.address; // Use deployer as fee collector for now
        const MarketManager = await ethers.getContractFactory('MarketManager');
        const marketManager = await MarketManager.deploy(predictionRoundAddress, feeCollector);
        await marketManager.waitForDeployment();
        const marketManagerAddress = await marketManager.getAddress();
        console.log('✅ MarketManager deployed at:', marketManagerAddress);
        
        // Step 3: Initialize markets
        console.log('\nStep 3: Initializing markets...');
        const markets = [
            { coin: 'BTC', feedId: '0x4254430000000000000000000000000000000000000000000000000000000000' },
            { coin: 'ETH', feedId: '0x4554480000000000000000000000000000000000000000000000000000000000' },
            { coin: 'SOL', feedId: '0x534f4c0000000000000000000000000000000000000000000000000000000000' },
            { coin: 'BNB', feedId: '0x424e420000000000000000000000000000000000000000000000000000000000' }
        ];
        
        for (const market of markets) {
            const tx = await marketManager.initializeMarket(market.coin, market.feedId);
            await tx.wait();
            console.log(`✅ ${market.coin} market initialized`);
        }
        
        // Step 4: Create initial rounds
        console.log('\nStep 4: Creating initial rounds...');
        for (const market of markets) {
            try {
                const tx = await marketManager.createRound(market.coin);
                await tx.wait();
                console.log(`✅ ${market.coin} round created`);
            } catch (error) {
                console.error(`❌ Error creating ${market.coin} round:`, error.message);
            }
        }
        
        // Step 5: Verify everything is working
        console.log('\nStep 5: Verifying system status...');
        for (const market of markets) {
            const marketInfo = await marketManager.getMarketInfo(market.coin);
            console.log(`${market.coin} - Current Round:`, marketInfo.currentRound);
        }
        
        console.log('\n=== DEPLOYMENT COMPLETE ===');
        console.log('New MarketManager Address:', marketManagerAddress);
        console.log('New PredictionRound Implementation:', predictionRoundAddress);
        console.log('\nUpdate your frontend .env.local with:');
        console.log(`NEXT_PUBLIC_MARKET_MANAGER_ADDRESS=${marketManagerAddress}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

redeployCompleteSystem().catch(console.error);