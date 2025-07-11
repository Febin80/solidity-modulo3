import { useState } from "react";
import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address.json";
import SimpleSwapABI from "./contracts/SimpleSwap.json";

const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

function AddLiquidity() {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [status, setStatus] = useState("");

  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address) && address.length === 42;
  }

  const canAdd = isValidAddress(tokenA) && isValidAddress(tokenB) && amountA !== "" && amountB !== "";

  async function approveToken(token: string, signer: any, spender: string, amount: any) {
    const erc20 = new ethers.Contract(token, ERC20ABI, signer);
    const allowance = await erc20.allowance(await signer.getAddress(), spender);
    if (allowance.lt(amount)) {
      const tx = await erc20.approve(spender, amount);
      await tx.wait();
    }
  }

  async function addLiquidity() {
    if (!canAdd) {
      setStatus("Completa todos los campos correctamente.");
      return;
    }
    setStatus("Enviando transacción...");
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, signer);

      const amountADesired = ethers.parseUnits(amountA, 18);
      const amountBDesired = ethers.parseUnits(amountB, 18);
      const amountAMin = 0;
      const amountBMin = 0;
      const to = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 300;

      await approveToken(tokenA, signer, contractAddress.SimpleSwap, amountADesired);
      await approveToken(tokenB, signer, contractAddress.SimpleSwap, amountBDesired);

      const tx = await contract.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline
      );
      await tx.wait();
      setStatus("Liquidez agregada correctamente");
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al agregar liquidez");
    }
  }

  return (
    <div style={{marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8}}>
      <h3>Agregar Liquidez</h3>
      <input placeholder="Dirección token A (0x...)" value={tokenA} onChange={e => setTokenA(e.target.value)} maxLength={42} />
      <input placeholder="Dirección token B (0x...)" value={tokenB} onChange={e => setTokenB(e.target.value)} maxLength={42} />
      <input placeholder="Cantidad Token A" value={amountA} onChange={e => setAmountA(e.target.value)} />
      <input placeholder="Cantidad Token B" value={amountB} onChange={e => setAmountB(e.target.value)} />
      <button onClick={addLiquidity} disabled={!canAdd}>Agregar Liquidez</button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default AddLiquidity;
