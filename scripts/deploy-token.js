// scripts/deploy-token.js
// Script para desplegar el contrato MyToken en Sepolia

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando contrato con la cuenta:", deployer.address);

  const MyToken = await ethers.getContractFactory("MyToken");
  const tokenA = await MyToken.deploy("TokenA", "TKA");
  await tokenA.waitForDeployment();
  console.log("TokenA desplegado en:", await tokenA.getAddress());

  const tokenB = await MyToken.deploy("TokenB", "TKB");
  await tokenB.waitForDeployment();
  console.log("TokenB desplegado en:", await tokenB.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
