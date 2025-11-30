import { useReadContract } from 'wagmi';
import MultiAssetOracleABI from '@/lib/abis/MultiAssetOracle.json';

const ORACLE_ADDRESS = '0x3841f920A0Ee56Bb75e7D5150ca31Bd641979d1a' as `0x${string}`;

export function useOraclePrice(symbol: string) {
    return useReadContract({
        address: ORACLE_ADDRESS,
        abi: MultiAssetOracleABI,
        functionName: 'read',
        args: [symbol],
        query: {
            refetchInterval: 1000, // Refetch every 1 second for real-time price updates
        },
    });
}
