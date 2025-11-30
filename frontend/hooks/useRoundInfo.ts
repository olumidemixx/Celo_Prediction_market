import { useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import MarketManagerABI from '@/lib/abis/MarketManager.json';
import PredictionRoundABI from '@/lib/abis/PredictionRound.json';

export function useCurrentRound(market: string) {
    return useReadContract({
        address: CONTRACTS.MARKET_MANAGER,
        abi: MarketManagerABI,
        functionName: 'getCurrentRound',
        args: [market],
        query: {
            refetchInterval: 10000, // Refetch every 10 seconds
        },
    });
}

export function useRoundInfo(roundAddress: `0x${string}` | undefined) {
    return useReadContract({
        address: roundAddress,
        abi: PredictionRoundABI,
        functionName: 'getRoundInfo',
        query: {
            enabled: !!roundAddress && roundAddress !== '0x0000000000000000000000000000000000000000',
            refetchInterval: 1000, // Refetch every 1 second for real-time price updates
        },
    });
}

export function useUserStake(roundAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
    return useReadContract({
        address: roundAddress,
        abi: PredictionRoundABI,
        functionName: 'getUserStake',
        args: userAddress ? [userAddress] : undefined,
        query: {
            enabled: !!roundAddress && !!userAddress && roundAddress !== '0x0000000000000000000000000000000000000000',
            refetchInterval: 5000,
        },
    });
}

export function useMarketInfo(market: string) {
    return useReadContract({
        address: CONTRACTS.MARKET_MANAGER,
        abi: MarketManagerABI,
        functionName: 'getMarketInfo',
        args: [market],
        query: {
            refetchInterval: 30000, // Refetch every 30 seconds
        },
    });
}
