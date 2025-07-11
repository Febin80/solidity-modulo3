// scripts/verify-setup.js
// Script para verificar que todo esté configurado correctamente

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Verificando configuración...\n");

  // 1. Verificar conexión a Sepolia
  console.log("1. Verificando conexión a Sepolia...");
  try {
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || 'demo'}`);
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Conectado a Sepolia en bloque:", blockNumber);
  } catch (e) {
    console.log("❌ No se puede conectar a Sepolia con Alchemy:", e.message);
    console.log("💡 Configura tu ALCHEMY_API_KEY en el archivo .env");
    console.log("💡 Obtén una API key gratuita en: https://www.alchemy.com/");
    return;
  }

  // 2. Verificar contratos desplegados
  console.log("\n2. Verificando contratos...");
  const contractAddressPath = path.join(__dirname, "../frontend/src/contracts/contract-address.json");
  
  if (!fs.existsSync(contractAddressPath)) {
    console.log("❌ Archivo de direcciones no encontrado");
    console.log("💡 Ejecuta: npx hardhat run scripts/deploy-all.js --network localhost");
    return;
  }

  const contractAddressData = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
  console.log("✅ Direcciones cargadas:");
  console.log("   SimpleSwap:", contractAddressData.SimpleSwap);
  console.log("   Token A:", contractAddressData.TokenA);
  console.log("   Token B:", contractAddressData.TokenB);

  // 3. Verificar que los contratos respondan
  console.log("\n3. Verificando contratos en Sepolia...");
  const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || 'demo'}`);
  
  try {
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    const MyToken = await ethers.getContractFactory("MyToken");
    
    const simpleSwap = SimpleSwap.attach(contractAddressData.SimpleSwap);
    const tokenA = MyToken.attach(contractAddressData.TokenA);
    const tokenB = MyToken.attach(contractAddressData.TokenB);

    // Verificar que los contratos existan
    const codeA = await provider.getCode(contractAddressData.TokenA);
    const codeB = await provider.getCode(contractAddressData.TokenB);
    const codeSwap = await provider.getCode(contractAddressData.SimpleSwap);

    if (codeA === "0x" || codeB === "0x" || codeSwap === "0x") {
      console.log("❌ Contratos no encontrados en la red");
      console.log("💡 Ejecuta: npx hardhat run scripts/deploy-all.js --network localhost");
      return;
    }

    console.log("✅ Contratos encontrados en la red");

    // 4. Verificar funciones básicas
    console.log("\n4. Verificando funciones...");
    
    const [deployer] = await ethers.getSigners();
    
    // Verificar balances
    const balanceA = await tokenA.balanceOf(deployer.address);
    const balanceB = await tokenB.balanceOf(deployer.address);
    console.log("✅ Balances verificados:");
    console.log("   Token A:", ethers.formatUnits(balanceA, 18));
    console.log("   Token B:", ethers.formatUnits(balanceB, 18));

    // Verificar reservas
    const [reserveA, reserveB] = await simpleSwap.getReserves(contractAddressData.TokenA, contractAddressData.TokenB);
    console.log("✅ Reservas verificadas:");
    console.log("   Reserva A:", ethers.formatUnits(reserveA, 18));
    console.log("   Reserva B:", ethers.formatUnits(reserveB, 18));

    // Verificar precio si hay liquidez
    if (reserveA > 0n && reserveB > 0n) {
      const price = await simpleSwap.getPrice(contractAddressData.TokenA, contractAddressData.TokenB);
      console.log("✅ Precio:", ethers.formatUnits(price, 18));
    } else {
      console.log("⚠️ Sin liquidez - ejecuta: npx hardhat run scripts/add-initial-liquidity.js --network localhost");
    }

  } catch (e) {
    console.log("❌ Error verificando contratos:", e.message);
  }

  // 5. Verificar configuración del frontend
  console.log("\n5. Verificando configuración del frontend...");
  const tokensConfigPath = path.join(__dirname, "../frontend/src/config/tokens.ts");
  
  if (fs.existsSync(tokensConfigPath)) {
    console.log("✅ Configuración de tokens encontrada");
  } else {
    console.log("⚠️ Configuración de tokens no encontrada");
  }

  console.log("\n🎉 Verificación completada!");
  console.log("\n📋 Para usar la aplicación:");
  console.log("1. Configura tu ALCHEMY_API_KEY en las variables de entorno");
  console.log("2. Conecta MetaMask a Sepolia (Chain ID: 11155111)");
  console.log("3. Abre http://localhost:3000");
  console.log("4. ¡Listo para usar!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
}); 