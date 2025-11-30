import pkg from 'hardhat';
const { ethers } = pkg;

async function checkOracle() {
    try {
        // RedStone oracle address from the contract
        const REDSTONE_ORACLE = '0x1EBF686b7db8E89e3D5CF2C3D0af26d96A068b7E';
        
        console.log('Checking RedStone Oracle at:', REDSTONE_ORACLE);
        
        // Try to read from the oracle
        const oracle = await ethers.getContractAt('IRedstoneOracle', REDSTONE_ORACLE);
        
        try {
            const price = await oracle.read();
            console.log('✅ Oracle read successful! Price:', price.toString());
            console.log('Price formatted:', ethers.formatEther(price));
        } catch (error) {
            console.error('❌ Oracle read failed:', error.message);
        }
        
        // Also check if this is the correct RedStone oracle address
        console.log('\nChecking if this is a valid contract...');
        const code = await ethers.provider.getCode(REDSTONE_ORACLE);
        console.log('Contract code length:', code.length);
        
        if (code.length === 0) {
            console.log('❌ No contract found at this address!');
        } else {
            console.log('✅ Contract found at this address');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkOracle().catch(console.error);