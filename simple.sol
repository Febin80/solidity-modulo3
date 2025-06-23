// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importamos la interfaz estándar de ERC20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleSwap {
    // Estructura que guarda las reservas de un par de tokens
    struct Reserve {
        uint reserveA;
        uint reserveB;
    }

    // Mapeo de pools: tokenA => tokenB => reservas del par
    mapping(address => mapping(address => Reserve)) public reserves;

    // Mapeo de liquidez: usuario => tokenA => tokenB => cantidad de liquidez
    mapping(address => mapping(address => mapping(address => uint))) public liquidity;

    // Eventos para registrar acciones importantes
    event LiquidityAdded(address indexed user, address tokenA, address tokenB, uint amountA, uint amountB, uint liquidity);
    event LiquidityRemoved(address indexed user, address tokenA, address tokenB, uint amountA, uint amountB);
    event Swapped(address indexed user, address tokenIn, address tokenOut, uint amountIn, uint amountOut);

    // ✅ FUNCION 1: Agregar Liquidez
    function addLiquidity(
        address tokenA, 
        address tokenB, 
        uint amountADesired, 
        uint amountBDesired, 
        uint amountAMin, 
        uint amountBMin, 
        address to, 
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidityMinted) {
        require(block.timestamp <= deadline, "SimpleSwap: EXPIRED");

        // Obtenemos las reservas actuales del pool
        Reserve storage reserve = reserves[tokenA][tokenB];

        // Transferimos los tokens desde el usuario al contrato
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);

        // Asignamos las cantidades efectivas
        amountA = amountADesired;
        amountB = amountBDesired;

        // Verificamos mínimos aceptables para proteger al usuario de cambios de precio
        require(amountA >= amountAMin && amountB >= amountBMin, "SimpleSwap: INSUFFICIENT_AMOUNT");

        // Actualizamos reservas del pool
        reserve.reserveA += amountA;
        reserve.reserveB += amountB;

        // Calculamos la liquidez a entregar (para este ejemplo, simplemente suma de los tokens aportados)
        liquidityMinted = amountA + amountB;
        liquidity[to][tokenA][tokenB] += liquidityMinted;

        // Emitimos evento de liquidez añadida
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidityMinted);
    }

    // ✅ FUNCION 2: Remover Liquidez
    function removeLiquidity(
        address tokenA, 
        address tokenB, 
        uint liquidityAmount, 
        uint amountAMin, 
        uint amountBMin, 
        address to, 
        uint deadline
    ) external returns (uint amountA, uint amountB) {
        require(block.timestamp <= deadline, "SimpleSwap: EXPIRED");

        // Obtenemos reservas del pool
        Reserve storage reserve = reserves[tokenA][tokenB];
        // Verificamos que el usuario tenga liquidez suficiente
        uint userLiquidity = liquidity[msg.sender][tokenA][tokenB];
        require(userLiquidity >= liquidityAmount, "SimpleSwap: INSUFFICIENT_LIQUIDITY");

        // Calculamos proporción de tokens a devolver
        uint totalLiquidity = reserve.reserveA + reserve.reserveB;
        amountA = (reserve.reserveA * liquidityAmount) / totalLiquidity;
        amountB = (reserve.reserveB * liquidityAmount) / totalLiquidity;

        // Verificamos mínimos aceptables
        require(amountA >= amountAMin && amountB >= amountBMin, "SimpleSwap: INSUFFICIENT_OUTPUT");

        // Actualizamos reservas
        reserve.reserveA -= amountA;
        reserve.reserveB -= amountB;
        // Restamos liquidez al usuario
        liquidity[msg.sender][tokenA][tokenB] -= liquidityAmount;

        // Transferimos tokens al usuario
        IERC20(tokenA).transfer(to, amountA);
        IERC20(tokenB).transfer(to, amountB);

        // Emitimos evento de retiro de liquidez
        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amountA, amountB);
    }

    // ✅ FUNCION 3: Intercambiar Tokens
    function swapExactTokensForTokens(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(path.length == 2, "SimpleSwap: INVALID_PATH");
        require(block.timestamp <= deadline, "SimpleSwap: EXPIRED");

        // Definimos tokens de entrada y salida
        address tokenIn = path[0];
        address tokenOut = path[1];
        Reserve storage reserve = reserves[tokenIn][tokenOut];

        // Transferimos token de entrada al contrato
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Calculamos cantidad de token de salida a entregar usando fórmula de constante producto
        uint amountOut = getAmountOut(amountIn, reserve.reserveA, reserve.reserveB);
        require(amountOut >= amountOutMin, "SimpleSwap: INSUFFICIENT_OUTPUT");

        // Actualizamos reservas
        reserve.reserveA += amountIn;
        reserve.reserveB -= amountOut;

        // Transferimos token de salida al usuario
        IERC20(tokenOut).transfer(to, amountOut);

        // Retornamos cantidades como array
        amounts = new uint ;
        amounts[0] = amountIn;
        amounts[1] = amountOut;

        // Emitimos evento de intercambio
        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ✅ FUNCION 4: Obtener Precio (tokenA en términos de tokenB)
    function getPrice(address tokenA, address tokenB) external view returns (uint price) {
        Reserve storage reserve = reserves[tokenA][tokenB];
        require(reserve.reserveA > 0 && reserve.reserveB > 0, "SimpleSwap: NO_LIQUIDITY");

        // Precio simple: cuántos tokenB por 1 tokenA (multiplicado por 1e18 para precisión)
        price = (reserve.reserveB * 1e18) / reserve.reserveA;
    }

    // ✅ FUNCION 5: Calcular cantidad a recibir al intercambiar
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) public pure returns (uint amountOut) {
        require(amountIn > 0, "SimpleSwap: INSUFFICIENT_INPUT");
        require(reserveIn > 0 && reserveOut > 0, "SimpleSwap: INSUFFICIENT_LIQUIDITY");

        // Fórmula de constante producto sin fee:
        // amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
    }
}
