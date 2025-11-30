'use client';

import Header from '@/components/Header';
import MarketGrid from '@/components/MarketGrid';
import StatsPanel from '@/components/StatsPanel';

export default function Home() {
    return (
        <main className="min-h-screen">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        <span className="gradient-text">Predict. Win. Repeat.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Bet on cryptocurrency price movements with CELO.
                        4-minute entry periods, 1-minute rounds, instant settlements.
                    </p>
                </div>

                {/* Stats Panel */}
                <StatsPanel />

                {/* Market Grid */}
                <MarketGrid />

                {/* Info Section */}
                <div className="mt-16 glass rounded-2xl p-8">
                    <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-4xl mb-2">⏱️</div>
                            <h3 className="font-semibold mb-2">4-Minute Entry</h3>
                            <p className="text-sm text-gray-400">
                                Place your prediction during the first 4 minutes of each round
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">📊</div>
                            <h3 className="font-semibold mb-2">Price Settlement</h3>
                            <p className="text-sm text-gray-400">
                                After 5 minutes total (4 min entry + 1 min round), the round settles using RedStone oracle prices
                            </p>
                        </div>
                        <div>
                            <div className="text-4xl mb-2">💰</div>
                            <h3 className="font-semibold mb-2">Win Big</h3>
                            <p className="text-sm text-gray-400">
                                Winners split the entire pot proportionally (1% fee)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-8 text-gray-500 text-sm">
                <p>Powered by Celo Sepolia Testnet • RedStone Oracle</p>
                <p className="mt-2">⚠️ Testnet Only - Not Real Money</p>
            </footer>
        </main>
    );
}
