import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWallet({ setProvider, setAccount, setNetwork }: any) {
  const [error, setError] = useState("");

  const connect = async () => {
    if (!(window as any).ethereum) {
      setError("MetaMask no está instalado");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      setProvider(provider);
      setAccount(accounts[0]);
      setNetwork(network);
      setError("");
    } catch (e) {
      setError("Error al conectar la billetera");
    }
  };

  return (
    <div>
      <button onClick={connect}>Conectar billetera</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
