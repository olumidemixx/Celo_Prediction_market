'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';
import { useState } from 'react';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <html lang="en">
            <head>
                <title>Celo Prediction Markets</title>
                <meta name="description" content="Predict cryptocurrency prices with CELO bets on Celo Sepolia" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider theme={darkTheme({
                            accentColor: '#fbcc5c',
                            accentColorForeground: 'black',
                            borderRadius: 'medium',
                        })}>
                            {children}
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </body>
        </html>
    );
}
