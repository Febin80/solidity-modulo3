# SimpleSwap DEX & MyToken

## Overview

This project contains two smart contracts deployed on Sepolia testnet:

- **MyToken**: An ERC20 token with owner-controlled minting  
- **SimpleSwap**: A minimal decentralized exchange for swapping tokens and managing liquidity pools  

---

## Contract Addresses on Sepolia

- MyToken: *[insert your deployed MyToken address]*  
- SimpleSwap: [0x9f8f02dab384dddf1591c3366069da3fb0018220](https://sepolia.etherscan.io/address/0x9f8f02dab384dddf1591c3366069da3fb0018220)

---

## SimpleSwap Functions

### addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)

Add liquidity tokens to the pool of tokenA and tokenB.

### removeLiquidity(tokenA, tokenB, liquidityAmount, amountAMin, amountBMin, to, deadline)

Remove liquidity tokens and withdraw the underlying tokens.

### swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)

Swap an exact amount of tokens for another token.

### getAmountOut(amountIn, reserveIn, reserveOut)

Calculate how many output tokens are received for a given input.

### getPrice(tokenA, tokenB)

Get the price of tokenA in terms of tokenB.

### getLiquidity(account)

Get liquidity tokens balance for an account.

---

## MyToken Functions

### mint(to, amount)

Owner-only minting function to create tokens.

---


## Notes

- Uses short require error messages for gas optimization  
- Avoids multiple storage reads for better gas efficiency  
- Comments and variables in English for clarity and standards compliance
