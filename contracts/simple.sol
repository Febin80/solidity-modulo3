// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

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

    mapping(address => mapping(address => Reserve)) private reserves;
    mapping(address => uint) private liquidity;

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
        require(block.timestamp <= deadline, "EXP");

        Reserve storage reserve = reserves[tokenA][tokenB];

        uint reserveA = reserve.reserveA;
        uint reserveB = reserve.reserveB;

        if (reserveA == 0 && reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint amountBOptimal = (amountADesired * reserveB) / reserveA;
            if (amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, "MINB");
                amountA = amountADesired;
                amountB = amountBOptimal;
            } else {
                uint amountAOptimal = (amountBDesired * reserveA) / reserveB;
                require(amountAOptimal >= amountAMin, "MINA");
                amountA = amountAOptimal;
                amountB = amountBDesired;
            }
        }

        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "TF1");
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "TF2");

        reserve.reserveA += amountA;
        reserve.reserveB += amountB;

        liquidity[to] += (amountA + amountB);

        liquidityMinted = amountA + amountB;
    }

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
        require(block.timestamp <= deadline, "EXP");
        require(liquidity[msg.sender] >= liquidityAmount, "LIQ");

        Reserve storage reserve = reserves[tokenA][tokenB];
        uint reserveA = reserve.reserveA;
        uint reserveB = reserve.reserveB;

        amountA = (liquidityAmount * reserveA) / (reserveA + reserveB);
        amountB = (liquidityAmount * reserveB) / (reserveA + reserveB);

        require(amountA >= amountAMin, "MINA");
        require(amountB >= amountBMin, "MINB");

        reserve.reserveA -= amountA;
        reserve.reserveB -= amountB;

        liquidity[msg.sender] -= liquidityAmount;

        require(IERC20(tokenA).transfer(to, amountA), "TT1");
        require(IERC20(tokenB).transfer(to, amountB), "TT2");
    }

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
        require(path.length == 2, "PATH");
        require(block.timestamp <= deadline, "EXP");

        address tokenIn = path[0];
        address tokenOut = path[1];

        Reserve storage reserve = reserves[tokenIn][tokenOut];
        uint reserveIn = reserve.reserveA;
        uint reserveOut = reserve.reserveB;

        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "TF");

        // Lógica inline de getAmountOut
        require(amountIn > 0, "AMT");
        require(reserveIn > 0 && reserveOut > 0, "NORES");
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        uint amountOut = numerator / denominator;
        require(amountOut >= amountOutMin, "MINO");

        reserve.reserveA += amountIn;
        reserve.reserveB -= amountOut;

        require(IERC20(tokenOut).transfer(to, amountOut), "TT");

        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = amountOut;
    }



    function getPrice(address tokenA, address tokenB) external view returns (uint price) {
        Reserve storage reserve = reserves[tokenA][tokenB];
        require(reserve.reserveA > 0 && reserve.reserveB > 0, "NORES");
        price = (reserve.reserveB * 1e18) / reserve.reserveA;
    }

    function getReserves(address tokenA, address tokenB) external view returns (uint reserveA, uint reserveB) {
        Reserve storage reserve = reserves[tokenA][tokenB];
        return (reserve.reserveA, reserve.reserveB);
    }
}
