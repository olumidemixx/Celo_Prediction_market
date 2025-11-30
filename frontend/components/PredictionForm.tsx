'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePlacePrediction } from '@/hooks/usePrediction';

interface PredictionFormProps {
    roundAddress: `0x${string}`;
}

export default function PredictionForm({ roundAddress }: PredictionFormProps) {
    const { isConnected } = useAccount();
    const [amount, setAmount] = useState('');
    const [direction, setDirection] = useState<'above' | 'below'>('above');
    const { placePrediction, isPending, isSuccess } = usePlacePrediction();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        placePrediction(roundAddress, direction === 'above', amount);
    };

    const fee = amount ? (parseFloat(amount) * 0.02).toFixed(4) : '0';
    const afterFee = amount ? (parseFloat(amount) * 0.98).toFixed(4) : '0';

    if (!isConnected) {
        return (
            <div className="text-center py-4 text-gray-500 text-sm">
                Connect wallet to place predictions
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="text-center py-4">
                <div className="text-green-500 font-semibold mb-2">✅ Prediction Placed!</div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-blue-500 hover:underline"
                >
                    Place Another
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Direction Selection */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setDirection('above')}
                    className={`py-3 rounded-lg font-semibold transition-all ${direction === 'above'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                        }`}
                >
                    📈 ABOVE
                </button>
                <button
                    type="button"
                    onClick={() => setDirection('below')}
                    className={`py-3 rounded-lg font-semibold transition-all ${direction === 'below'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                >
                    📉 BELOW
                </button>
            </div>

            {/* Amount Input */}
            <div>
                <label className="block text-sm text-gray-400 mb-2">
                    Amount (CELO)
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-primary focus:outline-none text-white"
                    disabled={isPending}
                />
            </div>

            {/* Fee Display */}
            {amount && parseFloat(amount) > 0 && (
                <div className="text-xs space-y-1 text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex justify-between">
                        <span>Amount:</span>
                        <span>{amount} CELO</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fee (2%):</span>
                        <span className="text-yellow-500">-{fee} CELO</span>
                    </div>
                    <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-1">
                        <span>Your Stake:</span>
                        <span>{afterFee} CELO</span>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isPending || !amount || parseFloat(amount) <= 0}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${direction === 'above'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                    } disabled:bg-gray-700 disabled:cursor-not-allowed`}
            >
                {isPending ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </span>
                ) : (
                    `Predict ${direction.toUpperCase()}`
                )}
            </button>
        </form>
    );
}
