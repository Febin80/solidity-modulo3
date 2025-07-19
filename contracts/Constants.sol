// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

library Constants {
    // Error messages
    string constant EXPIRED = "EXP";
    string constant INSUFFICIENT_LIQUIDITY = "LIQ";
    string constant INSUFFICIENT_AMOUNT_A = "MINA";
    string constant INSUFFICIENT_AMOUNT_B = "MINB";
    string constant INSUFFICIENT_OUTPUT = "MINO";
    string constant INVALID_PATH = "PATH";
    string constant INVALID_AMOUNT = "AMT";
    string constant NO_RESERVES = "NORES";
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