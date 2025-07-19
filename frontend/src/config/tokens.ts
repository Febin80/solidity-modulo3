// Token addresses - deployed on Sepolia 2025-07-19T21:07:37.450Z
export const EXAMPLE_TOKENS = {
  TOKEN_A: {
    address: "0xe3B2850F37F6a4Bed15b000eA3e2ac83dDc9dec2",
    name: "Token A",
    symbol: "TKA",
    decimals: 18
  },
  TOKEN_B: {
    address: "0xe9d61B88f035D1cB673003B47A6b223f56BdAB7F",
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
  SimpleSwap: "0x49aE76A3D53BA6fB7698117c130B7d8ADb388130",
  TokenA: "0xe3B2850F37F6a4Bed15b000eA3e2ac83dDc9dec2",
  TokenB: "0xe9d61B88f035D1cB673003B47A6b223f56BdAB7F"
};
