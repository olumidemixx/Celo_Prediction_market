export const CONTRACTS = {
    MARKET_MANAGER: (process.env.NEXT_PUBLIC_MARKET_MANAGER_ADDRESS || '') as `0x${string}`,
    CELO_SEPOLIA_CHAIN_ID: 11142220,
    REDSTONE_ORACLE: '0xeBDf5a33d34356A1cD336efF178Ef661085ca6ef' as `0x${string}`,
};

export const MARKETS = ['BTC', 'ETH', 'SOL', 'BNB'] as const;
export type Market = typeof MARKETS[number];

export const MARKET_ICONS: Record<Market, string> = {
    BTC: '₿',
    ETH: 'Ξ',
    SOL: '◎',
    BNB: '🔶',
};

export const MARKET_COLORS: Record<Market, string> = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    SOL: '#14F195',
    BNB: '#F3BA2F',
};
