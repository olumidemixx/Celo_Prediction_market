import pkg from 'hardhat';
const { ethers } = pkg;

async function createInitialRounds() {
    try {
        const marketManagerAddress = '0xAa3bC800159E1af47079EFa56E611aE6d8a0ba55';
        
        console.log('Connecting to MarketManager at:', marketManagerAddress);
        const marketManager = await ethers.getContractAt('MarketManager', marketManagerAddress);
        
        const markets = ['BTC', 'ETH', 'SOL', 'BNB'];
        const signers = await ethers.getSigners();
        const deployer = signers[0];
        
        console.log('Creating initial rounds for all markets...');
        
        for (const market of markets) {
            console.log(`\n--- Creating round for ${market} ---`);
            
            try {
                // Check if market is initialized
                const marketInfo = await marketManager.getMarketInfo(market);
                if (!marketInfo.initialized) {
                    console.log(`${market} market not initialized, skipping...`);
                    continue;
                }
                
                // Check if there's already a current round
                const currentRound = await marketManager.getCurrentRound(market);
                if (currentRound !== '0x0000000000000000000000000000000000000000') {
                    console.log(`${market} already has an active round:`, currentRound);
                    continue;
                }
                
                // Create new round
                console.log(`Creating round for ${market}...`);
                const tx = await marketManager.createRound(market);
                console.log(`Transaction sent: ${tx.hash}`);
                
                const receipt = await tx.wait();
                console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
                
                // Get the new round address
                const newRound = await marketManager.getCurrentRound(market);
                console.log(`✅ New round created for ${market}: ${newRound}`);
                
            } catch (error) {
                console.error(`Error creating round for ${market}:`, error.message);
            }
        }
        
        console.log('\n=== Final Status ===');
        for (const market of markets) {
            const currentRound = await marketManager.getCurrentRound(market);
            console.log(`${market} current round:`, currentRound);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createInitialRounds().catch(console.error);