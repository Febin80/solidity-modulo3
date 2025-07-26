const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleSwap - Coverage Completo", function () {
    let simpleSwap;
    let tokenA;
    let tokenB;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy tokens
        const Token = await ethers.getContractFactory("MyToken");
        tokenA = await Token.deploy("TokenA", "TKA");
        tokenB = await Token.deploy("TokenB", "TKB");

        // Deploy SimpleSwap
        const SimpleSwap = await ethers.getContractFactory("SimpleSwap");
        simpleSwap = await SimpleSwap.deploy();
        await simpleSwap.waitForDeployment();

        // Mint tokens para testing
        const mintAmount = ethers.parseEther("10000");
        await tokenA.mint(owner.address, mintAmount);
        await tokenB.mint(owner.address, mintAmount);
        await tokenA.mint(user1.address, mintAmount);
        await tokenB.mint(user1.address, mintAmount);
        await tokenA.mint(user2.address, mintAmount);
        await tokenB.mint(user2.address, mintAmount);
    });

    describe("addLiquidity - Casos completos", function () {
        it("debería agregar liquidez inicial (pool vacío)", async function () {
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));

            const result = await simpleSwap.addLiquidity(
                tokenA.target,
                tokenB.target,
                ethers.parseEther("100"),
                ethers.parseEther("200"),
                0, 0,
                owner.address,
                Math.floor(Date.now() / 1000) + 1000
            );

            const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);
            expect(reserveA).to.equal(ethers.parseEther("100"));
            expect(reserveB).to.equal(ethers.parseEther("200"));
        });

        it("debería agregar liquidez con ratio óptimo (amountBOptimal <= amountBDesired)", async function () {
            // Agregar liquidez inicial 100:200 (ratio 1:2)
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );

            // Agregar más liquidez manteniendo el ratio
            await tokenA.connect(user1).approve(simpleSwap.target, ethers.parseEther("50"));
            await tokenB.connect(user1).approve(simpleSwap.target, ethers.parseEther("150"));

            await simpleSwap.connect(user1).addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("50"), ethers.parseEther("150"), // amountBOptimal = 50*200/100 = 100 <= 150
                0, 0, user1.address, Math.floor(Date.now() / 1000) + 1000
            );

            const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);
            expect(reserveA).to.equal(ethers.parseEther("150"));
            expect(reserveB).to.equal(ethers.parseEther("300"));
        });

        it("debería agregar liquidez con ratio óptimo (amountAOptimal)", async function () {
            // Agregar liquidez inicial 100:200 (ratio 1:2)
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );

            // Intentar agregar liquidez con ratio diferente
            await tokenA.connect(user1).approve(simpleSwap.target, ethers.parseEther("200"));
            await tokenB.connect(user1).approve(simpleSwap.target, ethers.parseEther("50"));

            await simpleSwap.connect(user1).addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("200"), ethers.parseEther("50"), // amountBOptimal = 200*200/100 = 400 > 50, usa amountAOptimal = 50*100/200 = 25
                0, 0, user1.address, Math.floor(Date.now() / 1000) + 1000
            );

            const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);
            expect(reserveA).to.equal(ethers.parseEther("125")); // 100 + 25
            expect(reserveB).to.equal(ethers.parseEther("250")); // 200 + 50
        });

        it("debería fallar si el deadline ha expirado", async function () {
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));

            await expect(simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, 1 // deadline en el pasado
            )).to.be.revertedWith("EXP");
        });

        it("debería fallar si amountBOptimal < amountBMin", async function () {
            // Agregar liquidez inicial
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );

            // Intentar agregar con amountBMin muy alto
            await tokenA.connect(user1).approve(simpleSwap.target, ethers.parseEther("50"));
            await tokenB.connect(user1).approve(simpleSwap.target, ethers.parseEther("150"));

            await expect(simpleSwap.connect(user1).addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("50"), ethers.parseEther("150"),
                0, ethers.parseEther("120"), // amountBOptimal = 100, pero amountBMin = 120
                user1.address, Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("B<");
        });

        it("debería fallar si amountAOptimal < amountAMin", async function () {
            // Agregar liquidez inicial
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );

            // Intentar agregar con amountAMin muy alto
            await tokenA.connect(user1).approve(simpleSwap.target, ethers.parseEther("200"));
            await tokenB.connect(user1).approve(simpleSwap.target, ethers.parseEther("50"));

            await expect(simpleSwap.connect(user1).addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("200"), ethers.parseEther("50"),
                ethers.parseEther("30"), 0, // amountAOptimal = 25, pero amountAMin = 30
                user1.address, Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("A<");
        });
    });

    describe("removeLiquidity - Función no cubierta", function () {
        beforeEach(async function () {
            // Agregar liquidez inicial para poder removerla
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );
        });

        it("debería remover liquidez correctamente", async function () {
            const liquidityToRemove = ethers.parseEther("150"); // 50% de la liquidez total (300)

            const balanceABefore = await tokenA.balanceOf(owner.address);
            const balanceBBefore = await tokenB.balanceOf(owner.address);

            await simpleSwap.removeLiquidity(
                tokenA.target, tokenB.target,
                liquidityToRemove,
                0, 0, owner.address,
                Math.floor(Date.now() / 1000) + 1000
            );

            const balanceAAfter = await tokenA.balanceOf(owner.address);
            const balanceBAfter = await tokenB.balanceOf(owner.address);

            // Debería recibir 50 tokenA y 100 tokenB (50% de las reservas)
            expect(balanceAAfter - balanceABefore).to.equal(ethers.parseEther("50"));
            expect(balanceBAfter - balanceBBefore).to.equal(ethers.parseEther("100"));
        });

        it("debería fallar si no tiene suficiente liquidez", async function () {
            await expect(simpleSwap.connect(user1).removeLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"),
                0, 0, user1.address,
                Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("LIQ");
        });

        it("debería fallar si deadline ha expirado", async function () {
            await expect(simpleSwap.removeLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"),
                0, 0, owner.address, 1
            )).to.be.revertedWith("EXP");
        });

        it("debería fallar si amountA < amountAMin", async function () {
            await expect(simpleSwap.removeLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("150"),
                ethers.parseEther("60"), 0, // amountAMin muy alto
                owner.address, Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("A<");
        });

        it("debería fallar si amountB < amountBMin", async function () {
            await expect(simpleSwap.removeLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("150"),
                0, ethers.parseEther("120"), // amountBMin muy alto
                owner.address, Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("B<");
        });
    });

    describe("swapExactTokensForTokens - Función no cubierta", function () {
        beforeEach(async function () {
            // Agregar liquidez inicial para poder hacer swaps
            await tokenA.approve(simpleSwap.target, ethers.parseEther("1000"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("2000"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("1000"), ethers.parseEther("2000"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );
        });

        it("debería hacer swap correctamente", async function () {
            const amountIn = ethers.parseEther("100");
            await tokenA.connect(user1).approve(simpleSwap.target, amountIn);

            const balanceBBefore = await tokenB.balanceOf(user1.address);

            await simpleSwap.connect(user1).swapExactTokensForTokens(
                amountIn,
                0, // amountOutMin = 0 para simplificar
                [tokenA.target, tokenB.target],
                user1.address,
                Math.floor(Date.now() / 1000) + 1000
            );

            const balanceBAfter = await tokenB.balanceOf(user1.address);
            expect(balanceBAfter).to.be.gt(balanceBBefore);
        });

        it("debería fallar con path inválido (longitud != 2)", async function () {
            await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
                ethers.parseEther("100"),
                0,
                [tokenA.target], // path muy corto
                user1.address,
                Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("PTH");
        });

        it("debería fallar si deadline ha expirado", async function () {
            await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
                ethers.parseEther("100"),
                0,
                [tokenA.target, tokenB.target],
                user1.address,
                1 // deadline en el pasado
            )).to.be.revertedWith("EXP");
        });

        it("debería fallar con amountIn = 0", async function () {
            await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
                0,
                0,
                [tokenA.target, tokenB.target],
                user1.address,
                Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("AMT");
        });

        it("debería fallar si no hay reservas", async function () {
            // Deploy nuevos tokens sin liquidez
            const Token = await ethers.getContractFactory("MyToken");
            const tokenC = await Token.deploy("TokenC", "TKC");
            const tokenD = await Token.deploy("TokenD", "TKD");

            // Mint y approve tokens para el usuario
            await tokenC.mint(user1.address, ethers.parseEther("1000"));
            await tokenC.connect(user1).approve(simpleSwap.target, ethers.parseEther("100"));

            await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
                ethers.parseEther("100"),
                0,
                [tokenC.target, tokenD.target],
                user1.address,
                Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("NOR");
        });

        it("debería fallar si amountOut < amountOutMin", async function () {
            const amountIn = ethers.parseEther("100");
            await tokenA.connect(user1).approve(simpleSwap.target, amountIn);

            await expect(simpleSwap.connect(user1).swapExactTokensForTokens(
                amountIn,
                ethers.parseEther("1000"), // amountOutMin muy alto
                [tokenA.target, tokenB.target],
                user1.address,
                Math.floor(Date.now() / 1000) + 1000
            )).to.be.revertedWith("O<");
        });
    });

    describe("Funciones de vista - No cubiertas", function () {
        beforeEach(async function () {
            // Agregar liquidez para testing
            await tokenA.approve(simpleSwap.target, ethers.parseEther("100"));
            await tokenB.approve(simpleSwap.target, ethers.parseEther("200"));
            await simpleSwap.addLiquidity(
                tokenA.target, tokenB.target,
                ethers.parseEther("100"), ethers.parseEther("200"),
                0, 0, owner.address, Math.floor(Date.now() / 1000) + 1000
            );
        });

        it("getLiquidity - debería retornar la liquidez del usuario", async function () {
            const liquidity = await simpleSwap.getLiquidity(owner.address);
            expect(liquidity).to.equal(ethers.parseEther("300")); // 100 + 200
        });

        it("hasLiquidity - debería retornar true si hay liquidez", async function () {
            const hasLiq = await simpleSwap.hasLiquidity(tokenA.target, tokenB.target);
            expect(hasLiq).to.be.true;
        });

        it("hasLiquidity - debería retornar false si no hay liquidez", async function () {
            const Token = await ethers.getContractFactory("MyToken");
            const tokenC = await Token.deploy("TokenC", "TKC");
            const tokenD = await Token.deploy("TokenD", "TKD");

            const hasLiq = await simpleSwap.hasLiquidity(tokenC.target, tokenD.target);
            expect(hasLiq).to.be.false;
        });

        it("getAmountOut - debería calcular correctamente el output", async function () {
            const amountIn = ethers.parseEther("100");
            const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);

            const amountOut = await simpleSwap.getAmountOut(amountIn, reserveA, reserveB);
            expect(amountOut).to.be.gt(0);
        });

        it("getAmountOut - debería fallar con amountIn = 0", async function () {
            const [reserveA, reserveB] = await simpleSwap.getReserves(tokenA.target, tokenB.target);

            await expect(simpleSwap.getAmountOut(0, reserveA, reserveB))
                .to.be.revertedWith("AMT");
        });

        it("getAmountOut - debería fallar con reservas = 0", async function () {
            await expect(simpleSwap.getAmountOut(ethers.parseEther("100"), 0, 0))
                .to.be.revertedWith("NOR");
        });

        it("getPrice - debería fallar si no hay reservas", async function () {
            const Token = await ethers.getContractFactory("MyToken");
            const tokenC = await Token.deploy("TokenC", "TKC");
            const tokenD = await Token.deploy("TokenD", "TKD");

            await expect(simpleSwap.getPrice(tokenC.target, tokenD.target))
                .to.be.revertedWith("NOR");
        });
    });
});