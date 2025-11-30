import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function exportABI() {
    const contracts = ['MarketManager', 'PredictionRound'];
    const outputDir = path.join(__dirname, '../frontend/lib/abis');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('📦 Exporting ABIs...\n');

    contracts.forEach(contractName => {
        const artifactPath = path.join(
            __dirname,
            `../artifacts/contracts/${contractName}.sol/${contractName}.json`
        );

        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            const abiPath = path.join(outputDir, `${contractName}.json`);

            fs.writeFileSync(
                abiPath,
                JSON.stringify(artifact.abi, null, 2)
            );

            console.log(`✅ Exported ${contractName} ABI to ${abiPath}`);
        } else {
            console.log(`❌ Artifact not found: ${artifactPath}`);
            console.log(`   Run 'npx hardhat compile' first`);
        }
    });

    console.log('\n✨ ABI export complete!');
}

exportABI();
