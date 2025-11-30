'use client';

import { useState, useEffect } from 'react';
import { formatTimeRemaining, getTimeProgress } from '@/lib/utils';

interface CountdownTimerProps {
    entryDeadline: number;
    endTime: number;
    settled: boolean;
}

export default function CountdownTimer({ entryDeadline, endTime, settled }: CountdownTimerProps) {
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (settled) {
        return (
            <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className="text-lg font-bold text-blue-500">Round Settled</div>
                </div>
            </div>
        );
    }

    const isEntryPeriod = now <= entryDeadline;
    const targetTime = isEntryPeriod ? entryDeadline : endTime;
    const startTime = isEntryPeriod ? endTime - 300 : entryDeadline;
    const progress = getTimeProgress(startTime, targetTime);

    return (
        <div className={`mb-6 p-4 rounded-lg border ${isEntryPeriod
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                    {isEntryPeriod ? 'Entry Closes In' : 'Settlement In'}
                </span>
                <span className={`text-lg font-bold ${isEntryPeriod ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                    {formatTimeRemaining(targetTime)}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isEntryPeriod ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
