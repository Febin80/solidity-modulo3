import { useState } from "react";
import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address.json";
import SimpleSwapABI from "./contracts/SimpleSwap.json";

const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

function RemoveLiquidity() {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [liquidity, setLiquidity] = useState("");
  const [status, setStatus] = useState("");

  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address) && address.length === 42;
  }

  const canRemove = isValidAddress(tokenA) && isValidAddress(tokenB) && liquidity !== "";

  async function approveToken(token: string, signer: any, spender: string, amount: any) {
    const erc20 = new ethers.Contract(token, ERC20ABI, signer);
    const allowance = await erc20.allowance(await signer.getAddress(), spender);
    if (allowance.lt(amount)) {
      const tx = await erc20.approve(spender, amount);
      await tx.wait();
    }
  }

  async function removeLiquidity() {
    if (!canRemove) {
      setStatus("Completa todos los campos correctamente.");
      return;
    }
    setStatus("Enviando transacción...");
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, signer);

      const liquidityAmount = ethers.parseUnits(liquidity, 18);
      const amountAMin = 0;
      const amountBMin = 0;
      const to = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 300;

      // Approve tokens for the contract to spend
      await approveToken(tokenA, signer, contractAddress.SimpleSwap, liquidityAmount);
      await approveToken(tokenB, signer, contractAddress.SimpleSwap, liquidityAmount);

      const tx = await contract.removeLiquidity(
        tokenA,
        tokenB,
        liquidityAmount,
        amountAMin,
        amountBMin,
        to,
        deadline
      );
      await tx.wait();
      setStatus("Liquidez retirada correctamente");
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al retirar liquidez");
    }
  }

  return (
    <div style={{marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8}}>
      <h3>Retirar Liquidez</h3>
      <input placeholder="Dirección token A (0x...)" value={tokenA} onChange={e => setTokenA(e.target.value)} maxLength={42} />
      <input placeholder="Dirección token B (0x...)" value={tokenB} onChange={e => setTokenB(e.target.value)} maxLength={42} />
      <input placeholder="Liquidez a retirar" value={liquidity} onChange={e => setLiquidity(e.target.value)} />
      <button onClick={removeLiquidity} disabled={!canRemove}>Retirar Liquidez</button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default RemoveLiquidity;
