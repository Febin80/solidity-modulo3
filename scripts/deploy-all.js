// scripts/deploy-all.js
// Script para desplegar todos los contratos y guardar las direcciones

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contratos con la cuenta:", deployer.address);

  // Desplegar Token A
  console.log("\n1. Desplegando Token A...");
  const MyToken = await ethers.getContractFactory("MyToken");
  const tokenA = await MyToken.deploy("Token A", "TKA");
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("Token A desplegado en:", tokenAAddress);

  // Desplegar Token B
  console.log("\n2. Desplegando Token B...");
  const tokenB = await MyToken.deploy("Token B", "TKB");
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("Token B desplegado en:", tokenBAddress);

  // Desplegar SimpleSwap
  console.log("\n3. Desplegando SimpleSwap...");
  const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy();
  await simpleSwap.waitForDeployment();
  const simpleSwapAddress = await simpleSwap.getAddress();
  console.log("SimpleSwap desplegado en:", simpleSwapAddress);

  // Mint tokens para testing
  console.log("\n4. Minting tokens para testing...");
  const mintAmount = ethers.parseUnits("1000000", 18); // 1M tokens
  
  await tokenA.mint(deployer.address, mintAmount);
  console.log("Minted", ethers.formatUnits(mintAmount, 18), "TKA to", deployer.address);
  
  await tokenB.mint(deployer.address, mintAmount);
  console.log("Minted", ethers.formatUnits(mintAmount, 18), "TKB to", deployer.address);

  // Guardar direcciones en el frontend
  console.log("\n5. Guardando direcciones...");
  
  // Actualizar contract-address.json
  const contractAddressPath = path.join(__dirname, "../frontend/src/contracts/contract-address.json");
  const contractAddressData = {
    SimpleSwap: simpleSwapAddress,
    TokenA: tokenAAddress,
    TokenB: tokenBAddress
  };
  
  fs.writeFileSync(contractAddressPath, JSON.stringify(contractAddressData, null, 2));
  console.log("Direcciones guardadas en:", contractAddressPath);

  // Crear archivo de configuración de tokens
  const tokensConfigPath = path.join(__dirname, "../frontend/src/config/tokens.ts");
  const tokensConfigContent = `// Token addresses - deployed on ${new Date().toISOString()}
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

  fs.writeFileSync(tokensConfigPath, tokensConfigContent);
  console.log("Configuración de tokens guardada en:", tokensConfigPath);

  console.log("\n✅ Despliegue completado exitosamente!");
  console.log("\n📋 Resumen de direcciones:");
  console.log("SimpleSwap:", simpleSwapAddress);
  console.log("Token A:", tokenAAddress);
  console.log("Token B:", tokenBAddress);
  console.log("\n💡 Para usar en el frontend:");
  console.log("1. Copia las direcciones de los tokens en el componente TokenSwap");
  console.log("2. Asegúrate de que el contrato SimpleSwap esté desplegado en la red correcta");
  console.log("3. Conecta tu wallet y prueba el swap!");
}

main().catch((error) => {
  console.error("❌ Error durante el despliegue:", error);
  process.exitCode = 1;
}); 