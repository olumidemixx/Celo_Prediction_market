import pkg from 'hardhat';
const { ethers } = pkg;

async function deployMockOracle() {
    try {
        console.log('Deploying Mock Oracle...');
        
        // Deploy mock oracle with a reasonable price (e.g., $50,000 for BTC)
        const initialPrice = ethers.parseEther('50000'); // 50,000 USD with 18 decimals
        
        const MockOracle = await ethers.getContractFactory('MockOracle');
        const mockOracle = await MockOracle.deploy(initialPrice);
        await mockOracle.waitForDeployment();
        
        const mockOracleAddress = await mockOracle.getAddress();
        console.log('✅ Mock Oracle deployed at:', mockOracleAddress);
        console.log('Initial price set to:', ethers.formatEther(initialPrice), 'USD');
        
        // Test the oracle
        const price = await mockOracle.read();
        console.log('✅ Oracle read test successful:', ethers.formatEther(price), 'USD');
        
        console.log('\nNext steps:');
        console.log('1. Update the PredictionRound contract to use this mock oracle address');
        console.log('2. Redeploy the PredictionRound contract');
        console.log('3. Update the MarketManager with the new PredictionRound implementation');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

deployMockOracle().catch(console.error);