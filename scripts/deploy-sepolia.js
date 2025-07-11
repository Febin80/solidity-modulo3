// scripts/deploy-sepolia.js
// Script para desplegar en Sepolia testnet

require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Desplegando en Sepolia testnet...\n");

  // Verificar configuración
  const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
  const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

  if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === "your_alchemy_api_key_here") {
    console.log("❌ Error: ALCHEMY_API_KEY no configurada");
    console.log("💡 Configura tu API key de Alchemy en las variables de entorno");
    return;
  }

  if (!SEPOLIA_PRIVATE_KEY || SEPOLIA_PRIVATE_KEY === "your_private_key_here") {
    console.log("❌ Error: SEPOLIA_PRIVATE_KEY no configurada");
    console.log("💡 Configura tu private key en las variables de entorno");
    return;
  }

  const [deployer] = await ethers.getSigners();
  console.log("Desplegando con la cuenta:", deployer.address);

  // Verificar balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.log("❌ Balance insuficiente para desplegar");
    console.log("💡 Obtén ETH de Sepolia faucet: https://sepoliafaucet.com/");
    return;
  }

  try {
    // 1. Desplegar Token A
    console.log("\n1. Desplegando Token A...");
    const MyToken = await ethers.getContractFactory("MyToken");
    const tokenA = await MyToken.deploy("Token A", "TKA");
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    console.log("✅ Token A desplegado en:", tokenAAddress);

    // 2. Desplegar Token B
    console.log("\n2. Desplegando Token B...");
    const tokenB = await MyToken.deploy("Token B", "TKB");
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    console.log("✅ Token B desplegado en:", tokenBAddress);

    // 3. Desplegar SimpleSwap
    console.log("\n3. Desplegando SimpleSwap...");
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    const simpleSwap = await SimpleSwap.deploy();
    await simpleSwap.waitForDeployment();
    const simpleSwapAddress = await simpleSwap.getAddress();
    console.log("✅ SimpleSwap desplegado en:", simpleSwapAddress);

    // 4. Mint tokens para testing
    console.log("\n4. Minting tokens para testing...");
    const mintAmount = ethers.parseUnits("1000000", 18); // 1M tokens
    
    const mintA = await tokenA.mint(deployer.address, mintAmount);
    await mintA.wait();
    console.log("✅ Minted", ethers.formatUnits(mintAmount, 18), "TKA");
    
    const mintB = await tokenB.mint(deployer.address, mintAmount);
    await mintB.wait();
    console.log("✅ Minted", ethers.formatUnits(mintAmount, 18), "TKB");

    // 5. Guardar direcciones
    console.log("\n5. Guardando direcciones...");
    
    const contractAddressData = {
      SimpleSwap: simpleSwapAddress,
      TokenA: tokenAAddress,
      TokenB: tokenBAddress
    };
    
    const contractAddressPath = path.join(__dirname, "../frontend/src/contracts/contract-address.json");
    fs.writeFileSync(contractAddressPath, JSON.stringify(contractAddressData, null, 2));
    console.log("✅ Direcciones guardadas en:", contractAddressPath);

    // Crear archivo de configuración de tokens
    const tokensConfigContent = `// Token addresses - deployed on Sepolia ${new Date().toISOString()}
export const EXAMPLE_TOKENS = {
  TOKEN_A: {
    address: "${tokenAAddress}",
    name: "Token A",
    symbol: "TKA",
    decimals: 18
  },
  TOKEN_B: {
    address: "${tokenBAddress}",
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
  SimpleSwap: "${simpleSwapAddress}",
  TokenA: "${tokenAAddress}",
  TokenB: "${tokenBAddress}"
};
`;

    const tokensConfigPath = path.join(__dirname, "../frontend/src/config/tokens.ts");
    fs.writeFileSync(tokensConfigPath, tokensConfigContent);
    console.log("✅ Configuración de tokens guardada");

    console.log("\n🎉 ¡Despliegue en Sepolia completado!");
    console.log("\n📋 Resumen:");
    console.log("SimpleSwap:", simpleSwapAddress);
    console.log("Token A:", tokenAAddress);
    console.log("Token B:", tokenBAddress);
    console.log("\n🔗 Verificar en Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${simpleSwapAddress}`);
    console.log(`https://sepolia.etherscan.io/address/${tokenAAddress}`);
    console.log(`https://sepolia.etherscan.io/address/${tokenBAddress}`);

  } catch (error) {
    console.error("❌ Error durante el despliegue:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
}); 