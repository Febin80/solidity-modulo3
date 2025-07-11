const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap", function () {
  let tokenA, tokenB, swap, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MyToken");
    tokenA = await Token.deploy("TokenA", "TA");
    tokenB = await Token.deploy("TokenB", "TB");

    const Swap = await ethers.getContractFactory("SimpleSwap");
    swap = await Swap.deploy();

    await tokenA.mint(owner.address, ethers.parseEther("1000"));
    await tokenB.mint(owner.address, ethers.parseEther("1000"));

    await tokenA.approve(swap.target, ethers.parseEther("1000"));
    await tokenB.approve(swap.target, ethers.parseEther("1000"));
  });

  it("Should add liquidity", async () => {
    await swap.addLiquidity(
      tokenA.target,
      tokenB.target,
      ethers.parseEther("10"),
      ethers.parseEther("20"),
      0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
    );

    const price = await swap.getPrice(tokenA.target, tokenB.target);
    expect(price).to.be.gt(0);
  });
});
