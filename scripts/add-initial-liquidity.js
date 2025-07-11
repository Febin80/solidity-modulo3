// scripts/add-initial-liquidity.js
// Script para agregar liquidez inicial al pool

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Agregando liquidez inicial con la cuenta:", deployer.address);

  // Cargar direcciones
  const contractAddressPath = path.join(__dirname, "../frontend/src/contracts/contract-address.json");
  const contractAddressData = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));

  const simpleSwapAddress = contractAddressData.SimpleSwap;
  const tokenAAddress = contractAddressData.TokenA;
  const tokenBAddress = contractAddressData.TokenB;

  console.log("SimpleSwap:", simpleSwapAddress);
  console.log("Token A:", tokenAAddress);
  console.log("Token B:", tokenBAddress);

  // Obtener contratos
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const MyToken = await ethers.getContractFactory("MyToken");

  const simpleSwap = SimpleSwap.attach(simpleSwapAddress);
  const tokenA = MyToken.attach(tokenAAddress);
  const tokenB = MyToken.attach(tokenBAddress);

  // Cantidad de liquidez inicial
  const liquidityAmount = ethers.parseUnits("1000", 18); // 1000 tokens de cada uno

  console.log("\n1. Aprobando tokens...");
  
  // Aprobar tokens para el contrato SimpleSwap
  const approveA = await tokenA.approve(simpleSwapAddress, liquidityAmount);
  await approveA.wait();
  console.log("Token A aprobado");

  const approveB = await tokenB.approve(simpleSwapAddress, liquidityAmount);
  await approveB.wait();
  console.log("Token B aprobado");

  console.log("\n2. Agregando liquidez...");
  
  // Agregar liquidez
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutos
  
  const addLiquidityTx = await simpleSwap.addLiquidity(
    tokenAAddress,
    tokenBAddress,
    liquidityAmount,
    liquidityAmount,
    0, // amountAMin
    0, // amountBMin
    deployer.address,
    deadline
  );

  await addLiquidityTx.wait();
  console.log("✅ Liquidez agregada exitosamente!");

  // Verificar reservas
  const [reserveA, reserveB] = await simpleSwap.getReserves(tokenAAddress, tokenBAddress);
  console.log("\n📊 Reservas actuales:");
  console.log("Reserva Token A:", ethers.formatUnits(reserveA, 18));
  console.log("Reserva Token B:", ethers.formatUnits(reserveB, 18));

  // Obtener precio
  try {
    const price = await simpleSwap.getPrice(tokenAAddress, tokenBAddress);
    console.log("Precio (TokenA/TokenB):", ethers.formatUnits(price, 18));
  } catch (e) {
    console.log("No se pudo obtener el precio:", e.message);
  }

  console.log("\n🎉 ¡Pool listo para swaps!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
}); 