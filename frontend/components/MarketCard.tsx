'use client';

import { useAccount } from 'wagmi';
import { useCurrentRound, useRoundInfo, useUserStake } from '@/hooks/useRoundInfo';
import { useOraclePrice } from '@/hooks/useOraclePrice';
import { CONTRACTS, Market, MARKET_ICONS, MARKET_COLORS } from '@/lib/contracts';
import { formatPrice, formatCelo, isEntryPeriod, isSettleable } from '@/lib/utils';
import CountdownTimer from './CountdownTimer';
import PredictionForm from './PredictionForm';
import { useClaimWinnings } from '@/hooks/useClaimWinnings';

interface MarketCardProps {
    market: Market;
}

export default function MarketCard({ market }: MarketCardProps) {
    const { address, isConnected } = useAccount();
    const { data: roundAddress, isLoading: isLoadingAddress, error: roundAddressError } = useCurrentRound(market);
    const { data: roundInfo, isLoading: isLoadingRound, error: roundInfoError } = useRoundInfo(roundAddress as `0x${string}`);
    const { data: userStakeData } = useUserStake(roundAddress as `0x${string}`, address);
    const { claimWinnings, isPending: isClaiming } = useClaimWinnings();
    const { data: currentPriceData } = useOraclePrice(market);
    const currentPrice = currentPriceData as bigint | undefined;

    // Check if MarketManager contract is configured
    if (!CONTRACTS.MARKET_MANAGER) {
        return (
            <div className="glass rounded-2xl p-6 border-2 border-red-500/30">
                <div className="flex items-center space-x-3 mb-4">
                    <div
                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: MARKET_COLORS[market] + '20' }}
                    >
                        {MARKET_ICONS[market]}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{market}</h3>
                        <p className="text-sm text-gray-400">Prediction Market</p>
                    </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <div className="text-red-500 font-semibold mb-2">⚠️ Contract Not Configured</div>
                    <p className="text-sm text-gray-400">
                        MarketManager contract address is missing. Please check your .env.local file.
                    </p>
                </div>
            </div>
        );
    }

    // Show loading state while fetching round address
    if (isLoadingAddress) {
        return (
            <div className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-gray-700 rounded mb-4"></div>
                <div className="h-24 bg-gray-700 rounded"></div>
            </div>
        );
    }

    // Show error if failed to get round address
    if (roundAddressError) {
        return (
            <div className="glass rounded-2xl p-6 border-2 border-yellow-500/30">
                <div className="flex items-center space-x-3 mb-4">
                    <div
                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: MARKET_COLORS[market] + '20' }}
                    >
                        {MARKET_ICONS[market]}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{market}</h3>
                        <p className="text-sm text-gray-400">Prediction Market</p>
                    </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                    <div className="text-yellow-500 font-semibold mb-2">⚠️ Error Loading Market</div>
                    <p className="text-sm text-gray-400">
                        Failed to fetch current round. The contract may not be deployed or network connection failed.
                    </p>
                </div>
            </div>
        );
    }

    // Check if round address is valid
    if (!roundAddress || roundAddress === '0x0000000000000000000000000000000000000000') {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div
                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: MARKET_COLORS[market] + '20' }}
                    >
                        {MARKET_ICONS[market]}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{market}</h3>
                        <p className="text-sm text-gray-400">Prediction Market</p>
                    </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="text-blue-500 font-semibold mb-2">🔄 No Active Round</div>
                    <p className="text-sm text-gray-400">
                        Waiting for the next round to start. Rounds begin at the top of each hour.
                    </p>
                </div>
            </div>
        );
    }

    // Show loading state while fetching round info
    if (isLoadingRound) {
        return (
            <div className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-gray-700 rounded mb-4"></div>
                <div className="h-24 bg-gray-700 rounded"></div>
            </div>
        );
    }

    // Show error if failed to get round info
    if (roundInfoError || !roundInfo) {
        return (
            <div className="glass rounded-2xl p-6 border-2 border-red-500/30">
                <div className="flex items-center space-x-3 mb-4">
                    <div
                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: MARKET_COLORS[market] + '20' }}
                    >
                        {MARKET_ICONS[market]}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{market}</h3>
                        <p className="text-sm text-gray-400">Prediction Market</p>
                    </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <div className="text-red-500 font-semibold mb-2">❌ Error Loading Round Data</div>
                    <p className="text-sm text-gray-400 mb-2">
                        Failed to fetch round information. Please check your network connection.
                    </p>
                    <p className="text-xs text-gray-500">Round Address: {String(roundAddress)}</p>
                </div>
            </div>
        );
    }

    const [
        coin,
        strikePrice,
        finalPrice,
        startTime,
        entryDeadline,
        endTime,
        totalPool,
        settled,
        aboveWins,
        isDraw
    ] = roundInfo as any[];

    // Debug logging to understand the raw price values
    console.log(`${market} Market Debug:`, {
        rawStrikePrice: strikePrice?.toString(),
        rawFinalPrice: finalPrice?.toString(),
        formattedStrikePrice: formatPrice(strikePrice),
        formattedFinalPrice: formatPrice(finalPrice),
        market
    });

    const userStake = userStakeData ? (userStakeData as any)[0] : 0n;
    const userPrediction = userStakeData ? (userStakeData as any)[1] : false;
    const hasClaimed = userStakeData ? (userStakeData as any)[2] : false;

    const hasUserStake = userStake > 0n;
    const isEntry = isEntryPeriod(Number(entryDeadline));
    const canSettle = isSettleable(Number(endTime), settled);
    const canClaim = settled && hasUserStake && !hasClaimed;

    const calculatePayout = () => {
        if (!settled || !hasUserStake) return 0n;

        if (isDraw) {
            return userStake; // Refund original stake
        }

        // Check if user predicted correctly
        const userWon = (aboveWins && userPrediction) || (!aboveWins && !userPrediction);
        if (userWon) {
            // User gets percentage of total pool based on their stake vs total winning stakes
            // This is a simplified calculation - in reality, the contract handles this
            return userStake; // For now, show original stake (contract will calculate actual payout)
        }

        return 0n; // User lost, gets nothing
    };

    const payout = calculatePayout();

    return (
        <div
            className="glass rounded-2xl p-6 hover:border-opacity-30 transition-all duration-300"
            style={{ borderColor: MARKET_COLORS[market] + '40' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div
                        className="text-4xl w-14 h-14 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: MARKET_COLORS[market] + '20' }}
                    >
                        {MARKET_ICONS[market]}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{market}</h3>
                        <p className="text-sm text-gray-400">Prediction Market</p>
                    </div>
                </div>

                {settled && (
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDraw ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                        }`}>
                        {isDraw ? 'DRAW' : 'SETTLED'}
                    </div>
                )}

                {!settled && isEntry && (
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-500 animate-pulse">
                        ENTRY OPEN
                    </div>
                )}
            </div>

            {/* Price Info */}
            <div className="mb-6 space-y-3">
                {/* Current Live Price - Most Prominent */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-xs text-gray-400 mb-1">Current Price (Live)</div>
                    <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${currentPrice && strikePrice && currentPrice > strikePrice ? 'text-green-500' :
                            currentPrice && strikePrice && currentPrice < strikePrice ? 'text-red-500' :
                                'text-white'
                            }`}>
                            {currentPrice && currentPrice > 0n ? formatPrice(currentPrice) :
                                <span className="text-yellow-500">Loading...</span>}
                        </span>
                        {currentPrice && strikePrice && currentPrice !== strikePrice && (
                            <span className={`text-sm font-semibold ${currentPrice > strikePrice ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {currentPrice > strikePrice ? '↑' : '↓'}
                                {' '}
                                {Math.abs(Number(currentPrice - strikePrice) / Number(strikePrice) * 100).toFixed(2)}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Strike Price - Reference Point */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Strike Price (Start)</span>
                    <span className="text-lg font-semibold text-gray-300">
                        {strikePrice && strikePrice > 0n ? formatPrice(strikePrice) :
                            <span className="text-yellow-500">Loading...</span>}
                    </span>
                </div>

                {/* Final Price - Only shown when settled */}
                {settled && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                        <span className="text-sm text-gray-400">Final Price (Settlement)</span>
                        <span className={`text-lg font-bold ${finalPrice && strikePrice && finalPrice > strikePrice ? 'text-green-500' :
                            finalPrice && strikePrice && finalPrice < strikePrice ? 'text-red-500' :
                                'text-yellow-500'
                            }`}>
                            {finalPrice && finalPrice > 0n ? formatPrice(finalPrice) :
                                <span className="text-yellow-500">Pending...</span>}
                        </span>
                    </div>
                )}
            </div>

            {/* Countdown Timer */}
            <CountdownTimer
                entryDeadline={Number(entryDeadline)}
                endTime={Number(endTime)}
                settled={settled}
            />

            {/* Pool Stats */}
            <div className="mb-6">
                <div className="bg-gradient-to-r from-green-500/10 to-red-500/10 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Pool</div>
                    <div className="text-lg font-bold text-yellow-500">{formatCelo(totalPool)} CELO</div>
                </div>
            </div>

            {/* User Position */}
            {hasUserStake && (
                <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-sm font-semibold mb-2">Your Position</div>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Prediction:</span>
                            <span className={`font-semibold ${userPrediction ? 'text-green-500' : 'text-red-500'}`}>
                                {userPrediction ? 'ABOVE' : 'BELOW'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Stake:</span>
                            <span className="text-yellow-500 font-semibold">{formatCelo(userStake)} CELO</span>
                        </div>
                        {settled && payout > 0n && (
                            <div className="flex justify-between pt-2 border-t border-gray-700">
                                <span className="text-gray-400">Payout:</span>
                                <span className="text-green-500 font-bold">{formatCelo(payout)} CELO</span>
                            </div>
                        )}
                        {settled && payout === 0n && (
                            <div className="flex justify-between pt-2 border-t border-gray-700">
                                <span className="text-gray-400">Result:</span>
                                <span className="text-red-500 font-bold">Lost</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            {isEntry && !settled && (
                <PredictionForm roundAddress={roundAddress as `0x${string}`} />
            )}



            {canClaim && (
                <button
                    onClick={() => claimWinnings(roundAddress as `0x${string}`)}
                    disabled={isClaiming}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                >
                    {isClaiming ? 'Claiming...' : `Claim ${formatCelo(payout)} CELO`}
                </button>
            )}

            {settled && !hasUserStake && (
                <div className="text-center text-gray-500 text-sm py-3">
                    Round ended. Wait for next round.
                </div>
            )}
        </div>
    );
}
