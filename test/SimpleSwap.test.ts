import { expect } from "chai";
import { ethers } from "hardhat";

describe("SimpleSwap", function () {
  let simpleSwap: any;
  let tokenA: any;
  let tokenB: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("ERC20Mock");
    tokenA = await Token.deploy("TokenA", "TKA", owner.address, ethers.parseEther("1000"));
    tokenB = await Token.deploy("TokenB", "TKB", owner.address, ethers.parseEther("1000"));
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    simpleSwap = await SimpleSwap.deploy();
    await simpleSwap.waitForDeployment();
  });

  it("debería desplegar correctamente", async function () {
    expect(await simpleSwap.getAddress()).to.match(/^0x[a-fA-F0-9]{40}$/);
  });

  it("debería permitir agregar liquidez", async function () {
    await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
    await tokenB.approve(simpleSwap.target, ethers.parseEther("100"));
    await expect(simpleSwap.addLiquidity(tokenA.target, tokenB.target, ethers.parseEther("100"), ethers.parseEther("100")))
      .to.emit(simpleSwap, "LiquidityAdded");
  });

  // Agrega aquí más tests para swap y consulta de precio
});
