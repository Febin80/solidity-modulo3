# SimpleSwap DEX Frontend

A modern React-based frontend for a Uniswap-like Decentralized Exchange (DEX) deployed on the Sepolia testnet.

## 🚀 Features

- Swap tokens (input/output)
- Add and remove liquidity
- Real-time pool and price info
- Wallet connection (MetaMask)
- Sepolia testnet support
- Error handling and address validation

---

## 🛠️ Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure environment variables
If deploying to Vercel or Netlify, set these environment variables in the dashboard:
- `REACT_APP_NETWORK_ID=11155111`
- `REACT_APP_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`

For local development, you can create a `.env` file:
```
REACT_APP_NETWORK_ID=11155111
REACT_APP_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

---

## 🧑‍💻 Local Development

```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Deployment

### Deploy to Vercel
1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com), connect your repo, and deploy.
3. Set the environment variables in the Vercel dashboard.

### Deploy to Netlify
1. Run `npm run build` in the `frontend` folder.
2. Drag and drop the `build` folder to Netlify, or connect your repo.
3. Set the environment variables in the Netlify dashboard.

---

## ⚙️ Configuration

- **Contract addresses** are auto-generated after deployment and stored in `src/contracts/contract-address.json`.
- **Token config** is in `src/config/tokens.ts`.
- **ABI** is in `src/contracts/SimpleSwap.json`.

---

## 🦊 MetaMask Setup
- Connect to Sepolia testnet (Chain ID: 11155111)
- Get free Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

---

## 📝 Usage

1. Connect your wallet (MetaMask)
2. Add liquidity to the pool (if empty)
3. Swap tokens or remove liquidity as desired
4. Confirm all transactions in MetaMask

---

## 🐛 Troubleshooting

- **"Token contract not found on network"**: Make sure you are on Sepolia and contracts are deployed.
- **"contract.getReserves is not a function"**: Update the ABI in `src/contracts/SimpleSwap.json`.
- **MetaMask not popping up**: Ensure you are using the signer and are on Sepolia.

---

## 📄 License
MIT
