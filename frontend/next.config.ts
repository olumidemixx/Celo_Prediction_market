/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Empty turbopack config to acknowledge we're using Turbopack
    turbopack: {},

    // Externalize server-side packages to prevent bundling in client
    serverExternalPackages: ['pino', 'thread-stream', 'pino-pretty', 'lokijs', 'encoding'],

    // Ensure these packages are transpiled for the browser
    transpilePackages: ['@walletconnect/universal-provider', '@walletconnect/ethereum-provider'],

    // Keep webpack config for compatibility when not using Turbopack
    webpack: (config: any) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
            crypto: false,
        };

        config.externals.push(
            'pino-pretty',
            'lokijs',
            'encoding',
            '@react-native-async-storage/async-storage'
        );

        // Ignore specific problematic modules
        config.module = config.module || {};
        config.module.exprContextCritical = false;

        return config;
    },
};

export default nextConfig;
