const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap - asserts con callStatic", function () {
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

  it("debería retornar correctamente los valores al agregar liquidez", async function () {
    await tokenA.mint(user.address, ethers.parseEther("50"));
    await tokenB.mint(user.address, ethers.parseEther("50"));
    await tokenA.connect(user).approve(simpleSwap.target, ethers.parseEther("50"));
    await tokenB.connect(user).approve(simpleSwap.target, ethers.parseEther("50"));
    const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);
    const amountADesired = ethers.parseEther("50");
    const amountBDesired = ethers.parseEther("50");
    let expectedA, expectedB;
    if (reserveA == 0n && reserveB == 0n) {
      expectedA = amountADesired;
      expectedB = amountBDesired;
    } else {
      const amountBOptimal = amountADesired * reserveB / reserveA;
      if (amountBOptimal <= amountBDesired) {
        expectedA = amountADesired;
        expectedB = amountBOptimal;
      } else {
        const amountAOptimal = amountBDesired * reserveA / reserveB;
        expectedA = amountAOptimal;
        expectedB = amountBDesired;
      }
    }
    const expectedLiquidity = expectedA + expectedB;
    const result = await simpleSwap.connect(user).addLiquidity.staticCall(
      tokenA.target,
      tokenB.target,
      amountADesired,
      amountBDesired,
      0,
      0,
      user.address,
      Math.floor(Date.now() / 1000) + 1000
    );
    expect(result[0]).to.equal(expectedA);
    expect(result[1]).to.equal(expectedB);
    expect(result[2]).to.equal(expectedLiquidity);
  });

  it("debería retornar correctamente los valores al calcular el ratio de liquidez", async function () {
    await tokenA.mint(user.address, ethers.parseEther("200"));
    await tokenB.mint(user.address, ethers.parseEther("100"));
    await tokenA.connect(user).approve(simpleSwap.target, ethers.parseEther("200"));
    await tokenB.connect(user).approve(simpleSwap.target, ethers.parseEther("100"));
    const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);
    const amountADesired = ethers.parseEther("200");
    const amountBDesired = ethers.parseEther("100");
    let expectedA, expectedB;
    if (reserveA == 0n && reserveB == 0n) {
      expectedA = amountADesired;
      expectedB = amountBDesired;
    } else {
      const amountBOptimal = amountADesired * reserveB / reserveA;
      if (amountBOptimal <= amountBDesired) {
        expectedA = amountADesired;
        expectedB = amountBOptimal;
      } else {
        const amountAOptimal = amountBDesired * reserveA / reserveB;
        expectedA = amountAOptimal;
        expectedB = amountBDesired;
      }
    }
    const expectedLiquidity = expectedA + expectedB;
    const result = await simpleSwap.connect(user).addLiquidity.staticCall(
      tokenA.target,
      tokenB.target,
      amountADesired,
      amountBDesired,
      0,
      0,
      user.address,
      Math.floor(Date.now() / 1000) + 1000
    );
    expect(result[0]).to.equal(expectedA);
    expect(result[1]).to.equal(expectedB);
    expect(result[2]).to.equal(expectedLiquidity);
  });
});

describe("SimpleSwap - transacciones reales", function () {
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

  it("debería permitir agregar liquidez (transacción real)", async function () {
    await tokenA.mint(user.address, ethers.parseEther("50"));
    await tokenB.mint(user.address, ethers.parseEther("50"));
    await tokenA.connect(user).approve(simpleSwap.target, ethers.parseEther("50"));
    await tokenB.connect(user).approve(simpleSwap.target, ethers.parseEther("50"));
    await expect(simpleSwap.connect(user).addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseEther("50"),
      ethers.parseEther("50"),
      0,
      0,
      user.address,
      Math.floor(Date.now() / 1000) + 1000
    )).to.not.be.reverted;
  });

  it("debería permitir calcular el ratio de liquidez (transacción real)", async function () {
    await tokenA.mint(user.address, ethers.parseEther("200"));
    await tokenB.mint(user.address, ethers.parseEther("100"));
    await tokenA.connect(user).approve(simpleSwap.target, ethers.parseEther("200"));
    await tokenB.connect(user).approve(simpleSwap.target, ethers.parseEther("100"));
    await expect(simpleSwap.connect(user).addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseEther("200"),
      ethers.parseEther("100"),
      0,
      0,
      user.address,
      Math.floor(Date.now() / 1000) + 1000
    )).to.not.be.reverted;
  });
});
