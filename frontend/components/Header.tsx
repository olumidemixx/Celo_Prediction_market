'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
    return (
        <header className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">🎯</div>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">Celo Prediction Markets</h1>
                            <p className="text-xs text-gray-500">Celo Sepolia Testnet</p>
                        </div>
                    </div>

                    <ConnectButton
                        chainStatus="icon"
                        showBalance={false}
                    />
                </div>
            </div>
        </header>
    );
}
