import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import PredictionRoundABI from '@/lib/abis/PredictionRound.json';

export function useClaimWinnings() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } =
        useWaitForTransactionReceipt({ hash });

    const claimWinnings = (roundAddress: `0x${string}`) => {
        try {
            writeContract({
                address: roundAddress,
                abi: PredictionRoundABI,
                functionName: 'claim',
            });
        } catch (err) {
            console.error('Error claiming winnings:', err);
        }
    };

    return {
        claimWinnings,
        isPending: isPending || isConfirming,
        isSuccess,
        error,
        hash,
    };
}

export function useSettleRound() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } =
        useWaitForTransactionReceipt({ hash });

    const settleRound = (roundAddress: `0x${string}`) => {
        try {
            writeContract({
                address: roundAddress,
                abi: PredictionRoundABI,
                functionName: 'settle',
            });
        } catch (err) {
            console.error('Error settling round:', err);
        }
    };

    return {
        settleRound,
        isPending: isPending || isConfirming,
        isSuccess,
        error,
        hash,
    };
}
