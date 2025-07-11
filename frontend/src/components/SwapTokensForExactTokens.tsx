import React, { useState } from "react";
import { ethers } from "ethers";
import contractAddress from "../contracts/contract-address.json";
import SimpleSwapABI from "../contracts/SimpleSwap.json";

const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

function SwapTokensForExactTokens() {
  // Hardcoded token addresses (replace with your tokens)
  const tokenA = "" ;
  const tokenB = "";

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const canSwap = amountIn !== "";

  async function getAmountOut() {
    if (!canSwap) {
      setStatus("Ingresa la cantidad de Token A");
      return;
    }
    setStatus("Calculando cantidad de Token B...");
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, provider);

      const amountInWei = ethers.parseUnits(amountIn, 18);

      // Call getPrice to get price of tokenA in terms of tokenB
      const price = await contract.getPrice(tokenA, tokenB);
      if (!price || price.toString() === "0") {
        setAmountOut(null);
        setStatus("Sin liquidez para este par");
        return;
      }

      // Calculate amountOut = amountIn * price / 1e18
      const amountOutWei = (amountInWei * price) / ethers.parseUnits("1", 18);
      setAmountOut(ethers.formatUnits(amountOutWei, 18));
      setStatus("");
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al calcular cantidad de salida");
      setAmountOut(null);
    }
  }

  async function approveToken(token: string, signer: any, spender: string, amount: any) {
    const erc20 = new ethers.Contract(token, ERC20ABI, signer);
    const allowance = await erc20.allowance(await signer.getAddress(), spender);
    if (allowance.lt(amount)) {
      const tx = await erc20.approve(spender, amount);
      await tx.wait();
    }
  }

  async function swapTokens() {
    if (!canSwap) {
      setStatus("Ingresa la cantidad de Token A");
      return;
    }
    setStatus("Enviando transacción...");
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, signer);

      const amountInWei = ethers.parseUnits(amountIn, 18);
      const amountOutMin = 0;
      const path = [tokenA, tokenB];
      const to = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 300;

      await approveToken(tokenA, signer, contractAddress.SimpleSwap, amountInWei);

      const tx = await contract.swapExactTokensForTokens(
        amountInWei,
        amountOutMin,
        path,
        to,
        deadline
      );
      await tx.wait();
      setStatus("Swap completado");
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error en el swap");
    }
  }

  return (
    <div style={{marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8}}>
      <h3>Swap Exact Tokens For Tokens</h3>
      <p>Token A: {tokenA}</p>
      <p>Token B: {tokenB}</p>
      <input
        placeholder="Cantidad de Token A"
        value={amountIn}
        onChange={e => setAmountIn(e.target.value)}
      />
      <button onClick={getAmountOut} disabled={!canSwap}>Calcular cantidad de Token B</button>
      {amountOut && <p>Cantidad estimada de Token B: {amountOut}</p>}
      <button onClick={swapTokens} disabled={!canSwap}>Hacer Swap</button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default SwapTokensForExactTokens;
