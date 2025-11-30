'use client';

import { MARKETS } from '@/lib/contracts';
import MarketCard from './MarketCard';

export default function MarketGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {MARKETS.map((market) => (
                <MarketCard key={market} market={market} />
            ))}
        </div>
    );
}
