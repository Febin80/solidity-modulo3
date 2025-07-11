// scripts/add-liquidity-sepolia.js
// Script para agregar liquidez en Sepolia

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌊 Agregando liquidez en Sepolia...\n");

  // Verificar configuración
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

  if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === "your_alchemy_api_key_here") {
    console.log("❌ Error: ALCHEMY_API_KEY no configurada");
    return;
  }

  if (!SEPOLIA_PRIVATE_KEY || SEPOLIA_PRIVATE_KEY === "your_private_key_here") {
    console.log("❌ Error: SEPOLIA_PRIVATE_KEY no configurada");
    return;
  }

  // Cargar direcciones
  const contractAddressPath = path.join(__dirname, "../frontend/src/contracts/contract-address.json");
  
  if (!fs.existsSync(contractAddressPath)) {
    console.log("❌ Archivo de direcciones no encontrado");
    console.log("💡 Ejecuta primero: npx hardhat run scripts/deploy-sepolia.js --network sepolia");
    return;
  }

  const contractAddressData = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
  const simpleSwapAddress = contractAddressData.SimpleSwap;
  const tokenAAddress = contractAddressData.TokenA;
  const tokenBAddress = contractAddressData.TokenB;

  console.log("SimpleSwap:", simpleSwapAddress);
  console.log("Token A:", tokenAAddress);
  console.log("Token B:", tokenBAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Usando cuenta:", deployer.address);

  // Obtener contratos
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const MyToken = await ethers.getContractFactory("MyToken");

  const simpleSwap = SimpleSwap.attach(simpleSwapAddress);
  const tokenA = MyToken.attach(tokenAAddress);
  const tokenB = MyToken.attach(tokenBAddress);

  // Cantidad de liquidez inicial
  const liquidityAmount = ethers.parseUnits("1000", 18); // 1000 tokens de cada uno

  console.log("\n1. Verificando balances...");
  
  const balanceA = await tokenA.balanceOf(deployer.address);
  const balanceB = await tokenB.balanceOf(deployer.address);
  
  console.log("Balance Token A:", ethers.formatUnits(balanceA, 18));
  console.log("Balance Token B:", ethers.formatUnits(balanceB, 18));

  if (balanceA < liquidityAmount || balanceB < liquidityAmount) {
    console.log("❌ Balance insuficiente para agregar liquidez");
    console.log("💡 Necesitas al menos 1000 tokens de cada tipo");
    return;
  }

  console.log("\n2. Aprobando tokens...");
  
  try {
    // Aprobar tokens para el contrato SimpleSwap
    const approveA = await tokenA.approve(simpleSwapAddress, liquidityAmount);
    await approveA.wait();
    console.log("✅ Token A aprobado");

    const approveB = await tokenB.approve(simpleSwapAddress, liquidityAmount);
    await approveB.wait();
    console.log("✅ Token B aprobado");
  } catch (e) {
    console.log("❌ Error al aprobar tokens:", e.message);
    return;
  }

  console.log("\n3. Agregando liquidez...");
  
  try {
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

    console.log("\n🎉 ¡Pool listo para swaps en Sepolia!");

  } catch (e) {
    console.log("❌ Error al agregar liquidez:", e.message);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
}); 