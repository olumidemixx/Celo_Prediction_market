require('dotenv/config');
require('@nomicfoundation/hardhat-toolbox');

const { PRIVATE_KEY, RPC_URL_CELO_SEPOLIA } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.20',
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
      url: RPC_URL_CELO_SEPOLIA || 'https://forno.celo-sepolia.celo-testnet.org',
      chainId: 11142220,
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
