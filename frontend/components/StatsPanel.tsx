'use client';

import { useAccount } from 'wagmi';
import { MARKETS } from '@/lib/contracts';
import { useCurrentRound, useRoundInfo, useUserStake } from '@/hooks/useRoundInfo';
import { formatCelo } from '@/lib/utils';

export default function StatsPanel() {
    const { address } = useAccount();

    // Fetch all market data
    const btcRound = useCurrentRound('BTC');
    const ethRound = useCurrentRound('ETH');
    const solRound = useCurrentRound('SOL');
    const bnbRound = useCurrentRound('BNB');

    const btcInfo = useRoundInfo(btcRound.data as `0x${string}`);
    const ethInfo = useRoundInfo(ethRound.data as `0x${string}`);
    const solInfo = useRoundInfo(solRound.data as `0x${string}`);
    const bnbInfo = useRoundInfo(bnbRound.data as `0x${string}`);

    const btcUserStake = useUserStake(btcRound.data as `0x${string}`, address);
    const ethUserStake = useUserStake(ethRound.data as `0x${string}`, address);
    const solUserStake = useUserStake(solRound.data as `0x${string}`, address);
    const bnbUserStake = useUserStake(bnbRound.data as `0x${string}`, address);

    // Calculate total value locked
    const calculateTVL = () => {
        let total = 0n;

        if (btcInfo.data) {
            const [, , , , , , totalPool] = btcInfo.data as any[];
            total += totalPool;
        }
        if (ethInfo.data) {
            const [, , , , , , totalPool] = ethInfo.data as any[];
            total += totalPool;
        }
        if (solInfo.data) {
            const [, , , , , , totalPool] = solInfo.data as any[];
            total += totalPool;
        }
        if (bnbInfo.data) {
            const [, , , , , , totalPool] = bnbInfo.data as any[];
            total += totalPool;
        }

        return total;
    };

    // Calculate user's total positions
    const calculateUserPositions = () => {
        if (!address) return 0n;

        let total = 0n;

        if (btcUserStake.data) {
            const [userStake] = btcUserStake.data as any[];
            total += userStake;
        }
        if (ethUserStake.data) {
            const [userStake] = ethUserStake.data as any[];
            total += userStake;
        }
        if (solUserStake.data) {
            const [userStake] = solUserStake.data as any[];
            total += userStake;
        }
        if (bnbUserStake.data) {
            const [userStake] = bnbUserStake.data as any[];
            total += userStake;
        }

        return total;
    };

    const tvl = calculateTVL();
    const userPositions = calculateUserPositions();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Value Locked */}
            <div className="glass rounded-xl p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">Total Value Locked</div>
                <div className="text-3xl font-bold gradient-text">
                    {formatCelo(tvl)} CELO
                </div>
            </div>

            {/* Active Markets */}
            <div className="glass rounded-xl p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">Active Markets</div>
                <div className="text-3xl font-bold text-primary">
                    {MARKETS.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">BTC • ETH • SOL • BNB</div>
            </div>

            {/* Your Positions */}
            <div className="glass rounded-xl p-6 text-center">
                <div className="text-sm text-gray-400 mb-2">Your Active Positions</div>
                <div className="text-3xl font-bold text-blue-500">
                    {address ? formatCelo(userPositions) : '0'} CELO
                </div>
                {!address && (
                    <div className="text-xs text-gray-500 mt-1">Connect wallet to view</div>
                )}
            </div>
        </div>
    );
}
