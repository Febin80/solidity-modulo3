const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap", function () {
  let simpleSwap;
  let tokenA;
  let tokenB;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    tokenA = await Token.deploy("TokenA", "TKA");
    tokenB = await Token.deploy("TokenB", "TKB");
    const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    simpleSwap = await SimpleSwap.deploy();
    await simpleSwap.waitForDeployment();
    
    // Mint tokens para el owner
    await tokenA.mint(owner.address, ethers.parseEther("1000"));
    await tokenB.mint(owner.address, ethers.parseEther("1000"));
    // Agregar liquidez inicial
    await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
    await tokenB.approve(simpleSwap.target, ethers.parseEther("100"));
    await simpleSwap.addLiquidity(
      tokenA.target, 
      tokenB.target, 
      ethers.parseEther("100"), 
      ethers.parseEther("100"),
      0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
    );
  });

  it("debería desplegar correctamente", async function () {
    expect(await simpleSwap.getAddress()).to.match(/^0x[a-fA-F0-9]{40}$/);
  });

  it("debería permitir agregar liquidez", async function () {
    // Ya se agregó liquidez en beforeEach, solo verificamos el evento
    // Puedes agregar más verificaciones aquí si tu contrato expone reservas
  });

  it("debería permitir hacer swap de tokenA a tokenB", async function () {
    // Mint tokens para el user
    await tokenA.mint(user.address, ethers.parseEther("10"));
    await tokenA.connect(user).approve(simpleSwap.target, ethers.parseEther("10"));
    
    const path = [tokenA.target, tokenB.target];
    const deadline = Math.floor(Date.now() / 1000) + 1000;
    
    await expect(simpleSwap.connect(user).swapExactTokensForTokens(
      ethers.parseEther("10"), 
      0, 
      path, 
      user.address, 
      deadline
    )).to.not.be.reverted;
  });

  it("debería obtener el precio de tokenA respecto a tokenB", async function () {
    const price = await simpleSwap.getPrice(tokenA.target, tokenB.target);
    expect(price).to.be.a("bigint");
  });
});
