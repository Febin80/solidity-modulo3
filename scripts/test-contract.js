// scripts/test-contract.js
// Script para probar las funciones del contrato

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Probando contrato con la cuenta:", deployer.address);

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

  console.log("\n1. Probando balances de tokens...");
  
  const balanceA = await tokenA.balanceOf(deployer.address);
  const balanceB = await tokenB.balanceOf(deployer.address);
  
  console.log("Balance Token A:", ethers.formatUnits(balanceA, 18));
  console.log("Balance Token B:", ethers.formatUnits(balanceB, 18));

  console.log("\n2. Probando getReserves...");
  
  try {
    const [reserveA, reserveB] = await simpleSwap.getReserves(tokenAAddress, tokenBAddress);
    console.log("Reserva Token A:", ethers.formatUnits(reserveA, 18));
    console.log("Reserva Token B:", ethers.formatUnits(reserveB, 18));
  } catch (e) {
    console.log("Error en getReserves:", e.message);
  }

  console.log("\n3. Probando getPrice...");
  
  try {
    const price = await simpleSwap.getPrice(tokenAAddress, tokenBAddress);
    console.log("Precio:", ethers.formatUnits(price, 18));
  } catch (e) {
    console.log("Error en getPrice:", e.message);
  }

  console.log("\n4. Probando allowances...");
  
  const allowanceA = await tokenA.allowance(deployer.address, simpleSwapAddress);
  const allowanceB = await tokenB.allowance(deployer.address, simpleSwapAddress);
  
  console.log("Allowance Token A:", ethers.formatUnits(allowanceA, 18));
  console.log("Allowance Token B:", ethers.formatUnits(allowanceB, 18));
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
}); 