import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { defineChain } from 'viem';

// Define Celo Sepolia testnet
export const celoSepolia = defineChain({
    id: 11142220,
    name: 'Celo Sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'CELO',
        symbol: 'CELO',
    },
    rpcUrls: {
        default: {
            http: ['https://forno.celo-sepolia.celo-testnet.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Celo Explorer',
            url: 'https://sepolia.celoscan.io/',
        },
    },
    testnet: true,
});

export const config = getDefaultConfig({
    appName: 'Celo Prediction Markets',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [celoSepolia],
    ssr: true,
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [injectedWallet, metaMaskWallet, walletConnectWallet],
        },
    ],
});
