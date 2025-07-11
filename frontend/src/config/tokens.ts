// Token addresses - deployed on Sepolia 2025-07-11T04:31:14.035Z
export const EXAMPLE_TOKENS = {
  TOKEN_A: {
    address: "0x6bC6Ba4657bd071C5Edf9dfE7E79BA6BcC77a1E5",
    name: "Token A",
    symbol: "TKA",
    decimals: 18
  },
  TOKEN_B: {
    address: "0x2C32fc1a5afe84adAf8B18830229947dc6D9C0e7",
    name: "Token B", 
    symbol: "TKB",
    decimals: 18
  }
};

export const COMMON_PAIRS = [
  {
    name: "TKA/TKB",
    tokenA: EXAMPLE_TOKENS.TOKEN_A,
    tokenB: EXAMPLE_TOKENS.TOKEN_B
  }
];

export const CONTRACT_ADDRESSES = {
  SimpleSwap: "0xeDE438F0E6a4985387e013D28Be62c037eac899E",
  TokenA: "0x6bC6Ba4657bd071C5Edf9dfE7E79BA6BcC77a1E5",
  TokenB: "0x2C32fc1a5afe84adAf8B18830229947dc6D9C0e7"
};
