import pkg from 'hardhat';
const { ethers } = pkg;

async function redeployPredictionRound() {
    try {
        console.log('Redeploying PredictionRound with mock oracle...');
        
        // Deploy new PredictionRound implementation
        const PredictionRound = await ethers.getContractFactory('PredictionRound');
        const predictionRound = await PredictionRound.deploy();
        await predictionRound.waitForDeployment();
        
        const newImplementationAddress = await predictionRound.getAddress();
        console.log('✅ New PredictionRound deployed at:', newImplementationAddress);
        
        // Update MarketManager to use new implementation
        const marketManagerAddress = '0xfa8406CC295570faDB55F963Ee91Ec92D00eb0A5';
        console.log('Updating MarketManager at:', marketManagerAddress);
        
        const marketManager = await ethers.getContractAt('MarketManager', marketManagerAddress);
        
        // Note: The MarketManager contract doesn't have a function to update the implementation
        // We'll need to create a new MarketManager or modify the existing one
        console.log('Note: MarketManager needs to be updated to use the new implementation');
        console.log('New PredictionRound implementation:', newImplementationAddress);
        
        // Store the new implementation address for reference
        console.log('\nSave this address for updating the deployment scripts:');
        console.log('NEW_PREDICTION_ROUND_IMPLEMENTATION=', newImplementationAddress);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

redeployPredictionRound().catch(console.error);