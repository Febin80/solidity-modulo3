// scripts/deploy-swap.js

const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleSwap contract...");
  const SimpleSwap = await hre.ethers.getContractFactory("SimpleSwap");
  const simpleSwap = await SimpleSwap.deploy();
  await simpleSwap.waitForDeployment();
  console.log("SimpleSwap deployed to:", await simpleSwap.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});