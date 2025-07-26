// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./Constants.sol";

/**
 * @title SimpleSwap
 * @notice Optimized Uniswap-like DEX with minimal state access
 * @dev Gas-optimized with short error strings
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

        // Cache storage reads to minimize gas
        Reserve storage reserve = reserves[tokenA][tokenB];
        uint _reserveA = reserve.reserveA;
        uint _reserveB = reserve.reserveB;
        uint _userLiquidity = liquidity[to];

        if (_reserveA == 0 && _reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint amountBOptimal = (amountADesired * _reserveB) / _reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, Constants.INSUFFICIENT_AMOUNT_B);
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint amountAOptimal = (amountBDesired * _reserveA) / _reserveB;
                require(amountAOptimal >= amountAMin, Constants.INSUFFICIENT_AMOUNT_A);
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), Constants.TRANSFER_FAILED_1);
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), Constants.TRANSFER_FAILED_2);

        // Update storage once
        reserve.reserveA = _reserveA + amountA;
        reserve.reserveB = _reserveB + amountB;
        liquidity[to] = _userLiquidity + (amountA + amountB);

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
        
        // Cache storage reads
        uint _userLiquidity = liquidity[msg.sender];
        require(_userLiquidity >= liquidityAmount, Constants.INSUFFICIENT_LIQUIDITY);

        Reserve storage reserve = reserves[tokenA][tokenB];
        uint _reserveA = reserve.reserveA;
        uint _reserveB = reserve.reserveB;
        uint totalLiquidity = _reserveA + _reserveB;

        amountA = (liquidityAmount * _reserveA) / totalLiquidity;
        amountB = (liquidityAmount * _reserveB) / totalLiquidity;

        require(amountA >= amountAMin, Constants.INSUFFICIENT_AMOUNT_A);
        require(amountB >= amountBMin, Constants.INSUFFICIENT_AMOUNT_B);

        // Update storage once
        reserve.reserveA = _reserveA - amountA;
        reserve.reserveB = _reserveB - amountB;
        liquidity[msg.sender] = _userLiquidity - liquidityAmount;

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
        require(amountIn > 0, Constants.INVALID_AMOUNT);

        address tokenIn = path[0];
        address tokenOut = path[1];

        // Cache storage reads
        Reserve storage reserve = reserves[tokenIn][tokenOut];
        uint _reserveIn = reserve.reserveA;
        uint _reserveOut = reserve.reserveB;

        require(_reserveIn > 0 && _reserveOut > 0, Constants.NO_RESERVES);
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), Constants.TRANSFER_FAILED);

        // Calculate output with fee
        uint amountInWithFee = amountIn * Constants.FEE_NUMERATOR;
        uint numerator = amountInWithFee * _reserveOut;
        uint denominator = _reserveIn * Constants.FEE_DENOMINATOR + amountInWithFee;
        uint amountOut = numerator / denominator;
        require(amountOut >= amountOutMin, Constants.INSUFFICIENT_OUTPUT);

        // Update storage once
        reserve.reserveA = _reserveIn + amountIn;
        reserve.reserveB = _reserveOut - amountOut;

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
        uint _reserveA = reserve.reserveA;
        uint _reserveB = reserve.reserveB;
        require(_reserveA > 0 && _reserveB > 0, Constants.NO_RESERVES);
        price = (_reserveB * Constants.PRICE_PRECISION) / _reserveA;
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
        uint _reserveA = reserve.reserveA;
        uint _reserveB = reserve.reserveB;
        return (_reserveA, _reserveB);
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
        uint _reserveA = reserve.reserveA;
        uint _reserveB = reserve.reserveB;
        return _reserveA > 0 && _reserveB > 0;
    }

    /**
     * @notice Returns the output amount for a given input, using Uniswap formula
     * @param amountIn Input amount
     * @param reserveIn Reserve of input token
     * @param reserveOut Reserve of output token
     * @return amountOut Output amount
     */
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut) {
        require(amountIn > 0, Constants.INVALID_AMOUNT);
        require(reserveIn > 0 && reserveOut > 0, Constants.NO_RESERVES);
        uint amountInWithFee = amountIn * Constants.FEE_NUMERATOR;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * Constants.FEE_DENOMINATOR + amountInWithFee;
        amountOut = numerator / denominator;
    }
}
