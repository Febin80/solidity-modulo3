// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library Constants {
    // Short error messages (3-4 chars max)
    string constant EXPIRED = "EXP";
    string constant INSUFFICIENT_LIQUIDITY = "LIQ";
    string constant INSUFFICIENT_AMOUNT_A = "A<";
    string constant INSUFFICIENT_AMOUNT_B = "B<";
    string constant INSUFFICIENT_OUTPUT = "O<";
    string constant INVALID_PATH = "PTH";
    string constant INVALID_AMOUNT = "AMT";
    string constant NO_RESERVES = "NOR";
    string constant TRANSFER_FAILED_1 = "TF1";
    string constant TRANSFER_FAILED_2 = "TF2";
    string constant TRANSFER_FAILED = "TF";
    string constant TOKEN_TRANSFER_1 = "TT1";
    string constant TOKEN_TRANSFER_2 = "TT2";
    string constant TOKEN_TRANSFER = "TT";
    
    // Fee constants
    uint constant FEE_DENOMINATOR = 1000;
    uint constant FEE_NUMERATOR = 997;
    uint constant PRICE_PRECISION = 1e18;
} 