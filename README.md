# Celo Prediction Markets

A decentralized prediction markets platform on Celo Sepolia testnet where users bet on cryptocurrency price movements (BTC, ETH, SOL, BNB). Features automated 5-minute rounds with 4-minute entry periods, RedStone oracle integration, and a modern Next.js frontend with RainbowKit wallet support. 

This Youtube Video shows how it works: https://youtu.be/ikqvZwaZsOg

The Project is Deployed on:https://celo-prediction-market.onrender.com

![Celo Prediction Markets](https://img.shields.io/badge/Celo-Sepolia-fbcc5c?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?style=for-the-badge&logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)

## 🎯 Features

- **4 Active Markets**: BTC, ETH, SOL, BNB prediction markets
- **Automated Rounds**: New rounds every 5 minutes with 4-minute entry windows
- **RedStone Oracle**: Real-time price feeds for accurate settlements
- **Pro-Rata Payouts**: Winners split the entire pot proportionally, winners get thier extra profit as payout, alongside thier original stake.
- **1% Platform Fee**: Minimal fee on all entries
- **Modern UI**: Glassmorphism design with real-time countdowns
- **Wallet Integration**: RainbowKit with Celo Sepolia support

## 📋 Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Celo Sepolia testnet CELO tokens ([Get from faucet](https://faucet.celo.org/alfajores))
- WalletConnect Project ID ([Get from WalletConnect](https://cloud.walletconnect.com))

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd celo-prediction-markets
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Create `.env` in the root directory:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL_CELO_SEPOLIA=https://sepolia-forno.celo-testnet.org
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_MARKET_MANAGER_ADDRESS=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Run Tests

```bash
npx hardhat test
```

### 5. Deploy to Celo Sepolia

```bash
npm run deploy
```

**Important**: Copy the `MarketManager` address from the deployment output and add it to `frontend/.env.local`:

```env
NEXT_PUBLIC_MARKET_MANAGER_ADDRESS=0x...
```

### 6. Export ABIs

```bash
npm run generate-abi
```

### 7. Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
celo-prediction-markets/
├── contracts/
│   ├── PredictionRound.sol      # Individual round logic
│   └── MarketManager.sol        # Factory & market management
├── scripts/
│   ├── deploy.js                # Deployment script
│   └── export-abi.js            # ABI export utility
├── test/
│   └── PredictionMarkets.test.js
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Main page
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── Header.tsx           # Header with wallet connect
│   │   ├── MarketGrid.tsx       # Market grid layout
│   │   ├── MarketCard.tsx       # Individual market card
│   │   ├── PredictionForm.tsx   # Prediction entry form
│   │   ├── CountdownTimer.tsx   # Real-time countdown
│   │   └── StatsPanel.tsx       # TVL and stats display
│   ├── hooks/
│   │   ├── useRoundInfo.ts      # Contract read hooks
│   │   ├── usePrediction.ts     # Prediction placement
│   │   └── useClaimWinnings.ts  # Claim & settle hooks
│   └── lib/
│       ├── wagmi.ts             # Wagmi configuration
│       ├── contracts.ts         # Contract addresses
│       ├── utils.ts             # Utility functions
│       └── abis/                # Contract ABIs
├── hardhat.config.js
└── package.json
```

## 🎮 How to Use

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and select your wallet
2. **Choose Market**: Select BTC, ETH, SOL, or BNB
3. **Place Prediction**: 
   - Choose ABOVE or BELOW
   - Enter amount in CELO
   - Confirm transaction (1% fee applies)
4. **Wait for Settlement**: Rounds settle after 5 minutes
5. **Claim Winnings**: If you win, click "Claim" to receive your payout

### For Admins

```javascript
// Pause a market
await marketManager.pauseMarket("BTC");

// Unpause a market
await marketManager.unpauseMarket("BTC");

// Update fee collector
await marketManager.updateFeeCollector(newAddress);

// Create new round (if current round settled)
await marketManager.createRound("BTC");

// Settle and create next round
await marketManager.settleAndCreateNext("BTC");
```

## 🔧 Smart Contract Details

### PredictionRound.sol

- **Entry Period**: 4 minutes from round start
- **Total Duration**: 5 minutes
- **Fee**: 1% on all entries
- **Settlement**: Uses RedStone oracle for final price
- **Payout**: Pro-rata distribution to winners
- **Draw Handling**: Full refunds if final price equals strike price

### MarketManager.sol

- **Factory Pattern**: Uses OpenZeppelin Clones (EIP-1167)
- **Gas Efficient**: ~99% cheaper round deployment
- **4 Markets**: BTC, ETH, SOL, BNB
- **Admin Controls**: Pause/unpause markets, update fee collector

### RedStone Oracle Integration

- **Oracle Address**: `0x1eBf686b7Db8e89E3D5cF2C3d0AF26D96a068B7E`
- **Price Format**: 8 decimals (e.g., 4350000000000 = $43,500.00)
- **Feed IDs**:
  - BTC: `0x4254430000000000000000000000000000000000000000000000000000000000`
  - ETH: `0x4554480000000000000000000000000000000000000000000000000000000000`
  - SOL: `0x534f4c0000000000000000000000000000000000000000000000000000000000`
  - BNB: `0x424e420000000000000000000000000000000000000000000000000000000000`

## 🧪 Testing

Run the test suite:

```bash
npx hardhat test
```

For coverage:

```bash
npx hardhat coverage
```

## 🌐 Network Information

**Celo Sepolia Testnet**
- Chain ID: 44787
- RPC URL: https://alfajores-forno.celo-testnet.org
- Block Explorer: https://alfajores.celoscan.io/
- Faucet: https://faucet.celo.org/alfajores

## 📜 Available Scripts

### Root Directory

- `npm start` - Start frontend dev server
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend
- `npm test` - Run contract tests
- `npm run deploy` - Deploy to Celo Sepolia
- `npm run generate-abi` - Export ABIs to frontend

### Frontend Directory

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Security Considerations

- ✅ Reentrancy protection on all payable functions
- ✅ Access control on admin functions
- ✅ Input validation on all user inputs
- ✅ Emergency refund mechanism
- ✅ Oracle failure handling
- ✅ SafeMath operations (Solidity 0.8.19)

## 🎨 UI/UX Features

- **Dark Theme**: Modern glassmorphism design
- **Real-time Updates**: Auto-refresh every 5-10 seconds
- **Loading States**: Skeleton loaders and spinners
- **Transaction Feedback**: Success/error notifications
- **Responsive Design**: Mobile-first approach
- **Color Coding**:
  - 🟢 Green: Entry period active
  - 🟡 Yellow: Waiting for settlement
  - 🔵 Blue: Settled, claimable
  - 🔴 Red: Error states

