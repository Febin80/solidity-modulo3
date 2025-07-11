import React, { useState } from "react";
import { ethers } from "ethers";
import contractAddress from "../contracts/contract-address.json";
import SimpleSwapABI from "../contracts/SimpleSwap.json";

function Price() {
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [price, setPrice] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  function isValidAddress(address: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(address) && address.length === 42;
  }

  const canGetPrice = isValidAddress(tokenA) && isValidAddress(tokenB);

  async function getPrice() {
    if (!canGetPrice) {
      setStatus("Dirección inválida. Usa solo direcciones 0x válidas de 42 caracteres.");
      return;
    }
    setStatus("Obteniendo precio...");
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, provider);

      const p = await contract.getPrice(tokenA, tokenB);
      if (!p || p.toString() === "0") {
        setPrice(null);
        setStatus("Sin liquidez para este par");
      } else {
        setPrice(ethers.formatUnits(p, 18));
        setStatus("");
      }
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al obtener precio");
      setPrice(null);
    }
  }

  return (
    <div style={{marginTop: 32, padding: 16, border: '1px solid #ccc', borderRadius: 8}}>
      <h3>Obtener Precio</h3>
      <input placeholder="Dirección token A (0x...)" value={tokenA} onChange={e => setTokenA(e.target.value)} maxLength={42} />
      <input placeholder="Dirección token B (0x...)" value={tokenB} onChange={e => setTokenB(e.target.value)} maxLength={42} />
      <button onClick={getPrice} disabled={!canGetPrice}>Obtener Precio</button>
      {status && <p>{status}</p>}
      {price && <p>Precio: {price}</p>}
    </div>
  );
}

export default Price;
