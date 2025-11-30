export function formatCelo(value: bigint | undefined): string {
    if (!value) return '0';
    const formatted = Number(value) / 1e18;
    return formatted.toFixed(4);
}

export function formatPrice(price: bigint | undefined): string {
    if (!price || price === 0n) return '$0.00';
    
    // Handle both RedStone prices (8 decimals) and CELO token prices (18 decimals)
    // Determine the appropriate decimals based on the magnitude of the price
    let formatted: number;
    
    if (price > 100000000000000000000n) {
        // Large numbers likely have 18 decimals (like CELO token amounts)
        formatted = Number(price) / 1e18;
    } else {
        // Smaller numbers likely have 8 decimals (like RedStone oracle prices)
        formatted = Number(price) / 1e8;
    }
    
    // Validate the price is reasonable (between $0 and $1,000,000)
    if (formatted < 0 || formatted > 1000000) {
        console.warn(`Invalid price detected: ${price.toString()} -> ${formatted}`);
        return '$0.00';
    }
    
    return `$${formatted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatTimeRemaining(endTime: number): string {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return 'Ended';

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

export function getTimeProgress(startTime: number, endTime: number): number {
    const now = Math.floor(Date.now() / 1000);
    const total = endTime - startTime;
    const elapsed = now - startTime;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function isEntryPeriod(entryDeadline: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now <= entryDeadline;
}

export function isSettleable(endTime: number, settled: boolean): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now >= endTime && !settled;
}
