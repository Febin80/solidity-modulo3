# SimpleSwap DEX on Sepolia Testnet

A decentralized exchange (DEX) built with Solidity smart contracts and React frontend, deployed on the Sepolia testnet. This project implements core DEX functionality including token swapping, liquidity provision, and liquidity removal.

## Features

- **Token Swapping**: Swap between ERC-20 tokens with automatic price calculation
- **Add Liquidity**: Provide liquidity to earn trading fees
- **Remove Liquidity**: Withdraw your liquidity and earned fees
- **MetaMask Integration**: Seamless wallet connection
- **Sepolia Testnet**: Fully deployed and tested on Ethereum testnet
- **Modern React UI**: Clean, responsive interface

## Live Demo

- **Frontend**: [Deployed on Vercel](https://your-vercel-url.vercel.app)
- **Network**: Sepolia Testnet
- **Contract Addresses**: See frontend configuration files

## Project Structure

```
simpleswap-dex/
├── contracts/           # Solidity smart contracts
│   ├── Constants.sol    # Constants and error messages
│   ├── simple.sol       # Main DEX contract (SimpleSwap)
│   └── token.sol        # ERC-20 token contract (MyToken)
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   └── TokenSwap.tsx
│   │   └── ...
│   └── package.json
├── test/               # Contract tests
│   ├── SimpleSwap.js
│   └── SimpleSwap.test.js
├── scripts/            # Deployment scripts
├── artifacts/          # Compiled artifacts
├── cache/              # Hardhat cache
└── hardhat.config.js   # Hardhat configuration
```

## Smart Contracts

### SimpleSwap.sol
The main DEX contract that handles:
- Token swapping with automatic price calculation
- Liquidity pool management
- Fee collection and distribution
- Main functions: `addLiquidity()`, `removeLiquidity()`, `swapExactTokensForTokens()`

### MyToken.sol
Standard ERC-20 token contract used for testing DEX functionality. Includes `mint()` function for creating test tokens.

### Constants.sol
Library containing constants and optimized error messages for the SimpleSwap contract.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
ALCHEMY_API_KEY=your_alchemy_api_key_here
SEPOLIA_PRIVATE_KEY=your_wallet_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Important**: Make sure to configure the Alchemy API key and private key correctly. The private key should be from your MetaMask wallet (without the "0x" prefix).

### 2. Install Dependencies

```bash
# Install root project dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Compile Contracts

```bash
# Compile all contracts
npx hardhat compile
```

### 4. Run Tests

```bash
# Run the test suite
npx hardhat test
```

### 5. Deploy Contracts to Sepolia

```bash
# Deploy contracts (create your own deployment script)
npx hardhat run scripts/deploy.js --network sepolia
```

This will deploy:
- MyToken contracts (for testing)
- SimpleSwap DEX contract

### 6. Build and Deploy Frontend

```bash
# Build the React app
cd frontend
npm run build

# Deploy to Vercel (if using Vercel CLI)
vercel --prod
```

## Usage Guide

### Connecting Wallet

1. Open the application in your browser
2. Click "Connect Wallet" button
3. Approve the MetaMask connection
4. Make sure you're connected to Sepolia testnet

### Token Swapping

1. **Navigate to Swap**: Click on the "Swap" tab
2. **Select Tokens**: Choose the token you want to swap from and to
3. **Enter Amount**: Input the amount you want to swap
4. **Approve Tokens**: If it's your first time swapping a token, approve the DEX contract to spend your tokens
5. **Execute Swap**: Click "Swap" and confirm the transaction in MetaMask

**Note**: The first time you swap a token, you'll need to approve the DEX contract to spend your tokens. This is a one-time approval per token.

### Adding Liquidity

1. **Navigate to Add Liquidity**: Click on the "Add Liquidity" tab
2. **Select Tokens**: Choose the two tokens you want to provide liquidity for
3. **Enter Amounts**: Input the amounts for both tokens
4. **Approve Tokens**: Approve both tokens for the DEX contract
5. **Add Liquidity**: Click "Add Liquidity" and confirm the transaction

**Benefits**: By providing liquidity, you earn a portion of the trading fees proportional to your share of the pool.

### Removing Liquidity

1. **Navigate to Remove Liquidity**: Click on the "Remove Liquidity" tab
2. **Select Pool**: Choose the liquidity pool you want to withdraw from
3. **Enter LP Amount**: Input the amount of liquidity tokens to burn
4. **Remove Liquidity**: Click "Remove Liquidity" and confirm the transaction

**Note**: You'll receive back both tokens plus any accumulated trading fees.

## Technical Details

### Contract Functions

#### SimpleSwap.sol
- `swapExactTokensForTokens()`: Swap exact input tokens for output tokens
- `addLiquidity()`: Add liquidity to the pool
- `removeLiquidity()`: Remove liquidity from the pool
- `getReserves()`: Get current pool reserves
- `getAmountOut()`: Calculate output amount for a swap
- `getPrice()`: Get the price ratio between two tokens
- `getLiquidity()`: Get user's liquidity balance
- `hasLiquidity()`: Check if liquidity exists for a token pair

### Frontend Integration

The React frontend uses:
- **ethers.js**: For blockchain interaction
- **MetaMask**: For wallet connection
- **BigInt**: For handling large numbers and allowances
- **Error Handling**: Comprehensive error handling for all operations

### Key Features Implemented

1. **Allowance Management**: Proper handling of token approvals with BigInt support
2. **Price Calculation**: Automatic price calculation based on reserves
3. **Liquidity Pool Management**: Add and remove liquidity functionality
4. **Error Handling**: User-friendly error messages and transaction status
5. **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

### Common Issues

1. **"Contract not found on network"**
   - Ensure you're connected to Sepolia testnet
   - Check that contract addresses are updated in `frontend/contracts/contract-address.json`

2. **"Contract.getReserves is not a function"**
   - Verify the contract ABI is correctly imported
   - Check that the contract is properly deployed

3. **Allowance errors**
   - Make sure to approve tokens before swapping
   - Check that allowance amounts are sufficient

4. **Transaction failures**
   - Ensure you have enough Sepolia ETH for gas fees
   - Check that you have sufficient token balances

### Environment Variables

Make sure your `.env` file is properly configured:
```bash
ALCHEMY_API_KEY=your_alchemy_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
```

**Note**: Never commit your `.env` file to version control.

## Testing

Run the test suite:

```bash
npx hardhat test
```

## Deployment Verification

To verify your contracts on Etherscan:

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Hardhat and React
- Deployed on Sepolia testnet
- Frontend hosted on Vercel
- Inspired by Uniswap protocol