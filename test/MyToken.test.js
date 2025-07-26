const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken - Coverage Completo", function () {
  let token;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy MyToken - esto ejecuta el constructor
    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy("Test Token", "TEST");
    await token.waitForDeployment();
  });

  describe("Constructor", function () {
    it("debería configurar el nombre y símbolo correctamente", async function () {
      expect(await token.name()).to.equal("Test Token");
      expect(await token.symbol()).to.equal("TEST");
    });

    it("debería configurar el owner correctamente", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("debería tener supply inicial de 0", async function () {
      expect(await token.totalSupply()).to.equal(0);
    });
  });

  describe("Mint Function", function () {
    it("debería permitir al owner mintear tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await token.mint(user1.address, mintAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await token.totalSupply()).to.equal(mintAmount);
    });

    it("debería permitir mintear múltiples veces", async function () {
      const mintAmount1 = ethers.parseEther("500");
      const mintAmount2 = ethers.parseEther("300");
      
      await token.mint(user1.address, mintAmount1);
      await token.mint(user2.address, mintAmount2);
      
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount1);
      expect(await token.balanceOf(user2.address)).to.equal(mintAmount2);
      expect(await token.totalSupply()).to.equal(mintAmount1 + mintAmount2);
    });

    it("debería permitir mintear a la misma dirección múltiples veces", async function () {
      const mintAmount1 = ethers.parseEther("100");
      const mintAmount2 = ethers.parseEther("200");
      
      await token.mint(user1.address, mintAmount1);
      await token.mint(user1.address, mintAmount2);
      
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount1 + mintAmount2);
      expect(await token.totalSupply()).to.equal(mintAmount1 + mintAmount2);
    });

    it("debería fallar si no es el owner quien intenta mintear", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        token.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("debería permitir mintear cantidad 0", async function () {
      await token.mint(user1.address, 0);
      
      expect(await token.balanceOf(user1.address)).to.equal(0);
      expect(await token.totalSupply()).to.equal(0);
    });

    it("debería fallar al intentar mintear a la dirección 0", async function () {
      const mintAmount = ethers.parseEther("100");
      
      await expect(
        token.mint(ethers.ZeroAddress, mintAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });
  });

  describe("ERC20 Functionality", function () {
    beforeEach(async function () {
      // Mint some tokens for testing
      await token.mint(owner.address, ethers.parseEther("1000"));
      await token.mint(user1.address, ethers.parseEther("500"));
    });

    it("debería permitir transferencias", async function () {
      const transferAmount = ethers.parseEther("100");
      
      await token.transfer(user2.address, transferAmount);
      
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("900"));
      expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("debería permitir approvals y transferFrom", async function () {
      const approveAmount = ethers.parseEther("200");
      const transferAmount = ethers.parseEther("150");
      
      await token.connect(user1).approve(user2.address, approveAmount);
      await token.connect(user2).transferFrom(user1.address, owner.address, transferAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("350"));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1150"));
      expect(await token.allowance(user1.address, user2.address)).to.equal(ethers.parseEther("50"));
    });

    it("debería retornar decimals correctamente", async function () {
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Ownership", function () {
    it("debería permitir transferir ownership", async function () {
      await token.transferOwnership(user1.address);
      expect(await token.owner()).to.equal(user1.address);
    });

    it("debería permitir al nuevo owner mintear", async function () {
      await token.transferOwnership(user1.address);
      
      const mintAmount = ethers.parseEther("500");
      await token.connect(user1).mint(user2.address, mintAmount);
      
      expect(await token.balanceOf(user2.address)).to.equal(mintAmount);
    });

    it("debería fallar si el anterior owner intenta mintear después de transferir ownership", async function () {
      await token.transferOwnership(user1.address);
      
      const mintAmount = ethers.parseEther("500");
      await expect(
        token.mint(user2.address, mintAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("debería manejar cantidades muy grandes", async function () {
      const largeAmount = ethers.parseEther("1000000000"); // 1 billion tokens
      
      await token.mint(user1.address, largeAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(largeAmount);
      expect(await token.totalSupply()).to.equal(largeAmount);
    });

    it("debería permitir múltiples deployments con diferentes parámetros", async function () {
      const MyToken = await ethers.getContractFactory("MyToken");
      const token2 = await MyToken.deploy("Another Token", "ANOTHER");
      await token2.waitForDeployment();
      
      expect(await token2.name()).to.equal("Another Token");
      expect(await token2.symbol()).to.equal("ANOTHER");
      expect(await token2.owner()).to.equal(owner.address);
    });
  });
});