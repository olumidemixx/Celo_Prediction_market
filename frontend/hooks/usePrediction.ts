import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import PredictionRoundABI from '@/lib/abis/PredictionRound.json';

export function usePlacePrediction() {
    const { data: hash, writeContract, isPending, error } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } =
        useWaitForTransactionReceipt({ hash });

    const placePrediction = (
        roundAddress: `0x${string}`,
        isAbove: boolean,
        amount: string
    ) => {
        try {
            writeContract({
                address: roundAddress,
                abi: PredictionRoundABI,
                functionName: 'enter',
                args: [isAbove],
                value: parseEther(amount),
            });
        } catch (err) {
            console.error('Error placing prediction:', err);
        }
    };

    return {
        placePrediction,
        isPending: isPending || isConfirming,
        isSuccess,
        error,
        hash,
    };
}
