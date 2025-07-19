// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./Constants.sol";

/**
 * @title SimpleSwap
 * @notice A simple Uniswap-like DEX for swapping and providing liquidity between two ERC20 tokens
 * @dev Optimized to minimize state variable accesses and documented with NatSpec
 */
interface IERC20 {
    function totalSupply() external view returns (uint);
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
}

contract SimpleSwap {
    struct Reserve {
        uint reserveA;
        uint reserveB;
    }

    /// @notice Reserves for each token pair
    mapping(address => mapping(address => Reserve)) private reserves;
    /// @notice Liquidity for each user
    mapping(address => uint) private liquidity;

    /**
     * @notice Adds liquidity to a token pair
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @param amountADesired Desired amount of token A
     * @param amountBDesired Desired amount of token B
     * @param amountAMin Minimum acceptable amount of token A
     * @param amountBMin Minimum acceptable amount of token B
     * @param to Address to receive the liquidity
     * @param deadline Time limit for the operation
     * @return amountA Final amount of token A
     * @return amountB Final amount of token B
     * @return liquidityMinted Liquidity minted
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        returns (uint amountA, uint amountB, uint liquidityMinted)
    {
        require(block.timestamp <= deadline, Constants.EXPIRED);

        Reserve storage reserve = reserves[tokenA][tokenB];
        uint reserveA = reserve.reserveA;
        uint reserveB = reserve.reserveB;
        uint userLiquidity = liquidity[to];

        if (reserveA == 0 && reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, Constants.INSUFFICIENT_AMOUNT_B);
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint amountAOptimal = (amountBDesired * reserveA) / reserveB;
                require(amountAOptimal >= amountAMin, Constants.INSUFFICIENT_AMOUNT_A);
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), Constants.TRANSFER_FAILED_1);
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), Constants.TRANSFER_FAILED_2);

        reserve.reserveA = reserveA + amountA;
        reserve.reserveB = reserveB + amountB;
        liquidity[to] = userLiquidity + (amountA + amountB);

        liquidityMinted = amountA + amountB;
    }

    /**
     * @notice Removes liquidity from a token pair
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @param liquidityAmount Amount of liquidity to remove
     * @param amountAMin Minimum acceptable amount of token A
     * @param amountBMin Minimum acceptable amount of token B
     * @param to Address to receive the tokens
     * @param deadline Time limit for the operation
     * @return amountA Amount of token A withdrawn
     * @return amountB Amount of token B withdrawn
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidityAmount,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        returns (uint amountA, uint amountB)
    {
        require(block.timestamp <= deadline, Constants.EXPIRED);
        uint userLiquidity = liquidity[msg.sender];
        require(userLiquidity >= liquidityAmount, Constants.INSUFFICIENT_LIQUIDITY);

        Reserve storage reserve = reserves[tokenA][tokenB];
        uint reserveA = reserve.reserveA;
        uint reserveB = reserve.reserveB;
        uint totalLiquidity = reserveA + reserveB;

        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        require(amountA >= amountAMin, Constants.INSUFFICIENT_AMOUNT_A);
        require(amountB >= amountBMin, Constants.INSUFFICIENT_AMOUNT_B);

        reserve.reserveA = reserveA - amountA;
        reserve.reserveB = reserveB - amountB;
        liquidity[msg.sender] = userLiquidity - liquidityAmount;

        require(IERC20(tokenA).transfer(to, amountA), Constants.TOKEN_TRANSFER_1);
        require(IERC20(tokenB).transfer(to, amountB), Constants.TOKEN_TRANSFER_2);
    }

    /**
     * @notice Executes an exact token swap
     * @param amountIn Input amount
     * @param amountOutMin Minimum acceptable output amount
     * @param path Token path (must be length 2)
     * @param to Destination address
     * @param deadline Time limit for the operation
     * @return amounts Array with amountIn and amountOut
     */
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
        external
        returns (uint[] memory amounts)
    {
        require(path.length == 2, Constants.INVALID_PATH);
        require(block.timestamp <= deadline, Constants.EXPIRED);

        address tokenIn = path[0];
        address tokenOut = path[1];

        Reserve storage reserve = reserves[tokenIn][tokenOut];
        uint reserveIn = reserve.reserveA;
        uint reserveOut = reserve.reserveB;

        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), Constants.TRANSFER_FAILED);

        require(amountIn > 0, Constants.INVALID_AMOUNT);
        require(reserveIn > 0 && reserveOut > 0, Constants.NO_RESERVES);
        uint amountInWithFee = amountIn * Constants.FEE_NUMERATOR;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * Constants.FEE_DENOMINATOR + amountInWithFee;
        uint amountOut = numerator / denominator;
        require(amountOut >= amountOutMin, Constants.INSUFFICIENT_OUTPUT);

        reserve.reserveA = reserveIn + amountIn;
        reserve.reserveB = reserveOut - amountOut;

        require(IERC20(tokenOut).transfer(to, amountOut), Constants.TOKEN_TRANSFER);

        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }

    /**
     * @notice Returns the price of a token pair
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @return price Price of the pair (with 18 decimals)
     */
    function getPrice(address tokenA, address tokenB) external view returns (uint price) {
        Reserve storage reserve = reserves[tokenA][tokenB];
        require(reserve.reserveA > 0 && reserve.reserveB > 0, Constants.NO_RESERVES);
        price = (reserve.reserveB * Constants.PRICE_PRECISION) / reserve.reserveA;
    }

    /**
     * @notice Returns the reserves of a token pair
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @return reserveA Reserve of token A
     * @return reserveB Reserve of token B
     */
    function getReserves(address tokenA, address tokenB) external view returns (uint reserveA, uint reserveB) {
        Reserve storage reserve = reserves[tokenA][tokenB];
        return (reserve.reserveA, reserve.reserveB);
    }

    /**
     * @notice Returns the liquidity of a user
     * @param user Address of the user
     * @return User's liquidity
     */
    function getLiquidity(address user) external view returns (uint) {
        return liquidity[user];
    }

    /**
     * @notice Checks if there is liquidity for a pair
     * @param tokenA Address of token A
     * @param tokenB Address of token B
     * @return true if there is liquidity, false otherwise
     */
    function hasLiquidity(address tokenA, address tokenB) external view returns (bool) {
        Reserve storage reserve = reserves[tokenA][tokenB];
        return reserve.reserveA > 0 && reserve.reserveB > 0;
    }

    /**
     * @notice Returns the output amount for a given input, using Uniswap formula
     * @param amountIn Input amount
     * @param reserveIn Reserve of input token
     * @param reserveOut Reserve of output token
     * @return amountOut Output amount
     */
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut) {
        require(amountIn > 0, "AMT");
        require(reserveIn > 0 && reserveOut > 0, "NORES");
        uint amountInWithFee = amountIn * Constants.FEE_NUMERATOR;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * Constants.FEE_DENOMINATOR + amountInWithFee;
        amountOut = numerator / denominator;
    }
}
