import 'dotenv/config';
import '@nomicfoundation/hardhat-toolbox';

const { PRIVATE_KEY, RPC_URL_CELO_SEPOLIA } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      forking: undefined,
    },
    celoSepolia: {
      url: RPC_URL_CELO_SEPOLIA || 'https://alfajores-forno.celo-testnet.org',
      chainId: 44787,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
