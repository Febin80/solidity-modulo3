import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractAddress from "../contracts/contract-address.json";
import SimpleSwapABI from "../contracts/SimpleSwap.json";
import { EXAMPLE_TOKENS } from "../config/tokens";
import { 
  NETWORK_CONFIG, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  UI_LABELS, 
  PLACEHOLDERS, 
  VALIDATION,
  STYLES 
} from "../config/constants";

const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function totalSupply() external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  balance: string;
}

interface PoolInfo {
  reserveA: string;
  reserveB: string;
  price: string;
  totalLiquidity: string;
}

function TokenSwap() {
  const [tokenA, setTokenA] = useState<TokenInfo>({
    address: EXAMPLE_TOKENS.TOKEN_A.address !== "0x..." ? EXAMPLE_TOKENS.TOKEN_A.address : "",
    symbol: EXAMPLE_TOKENS.TOKEN_A.symbol,
    name: EXAMPLE_TOKENS.TOKEN_A.name,
    balance: "0"
  });
  
  const [tokenB, setTokenB] = useState<TokenInfo>({
    address: EXAMPLE_TOKENS.TOKEN_B.address !== "0x..." ? EXAMPLE_TOKENS.TOKEN_B.address : "",
    symbol: EXAMPLE_TOKENS.TOKEN_B.symbol,
    name: EXAMPLE_TOKENS.TOKEN_B.name,
    balance: "0"
  });

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [liquidityAmountA, setLiquidityAmountA] = useState("");
  const [liquidityAmountB, setLiquidityAmountB] = useState("");
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const canSwap = walletConnected && 
                 amountIn !== "" && 
                 tokenA.address && 
                 tokenB.address && 
                 ethers.isAddress(tokenA.address) && 
                 ethers.isAddress(tokenB.address);
                 
  const canAddLiquidity = walletConnected && 
                         liquidityAmountA !== "" && 
                         liquidityAmountB !== "" && 
                         tokenA.address && 
                         tokenB.address &&
                         ethers.isAddress(tokenA.address) && 
                         ethers.isAddress(tokenB.address);

  const canRemoveLiquidity = walletConnected && 
                            removeLiquidityAmount !== "" && 
                            tokenA.address && 
                            tokenB.address &&
                            ethers.isAddress(tokenA.address) && 
                            ethers.isAddress(tokenB.address);

  // Check wallet connection on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Load token information when addresses change
  useEffect(() => {
    if (tokenA.address && tokenB.address) {
      loadTokenInfo(tokenA.address, setTokenA);
      loadTokenInfo(tokenB.address, setTokenB);
      loadPoolInfo();
    }
  }, [tokenA.address, tokenB.address]);

  async function checkWalletConnection() {
    try {
      // @ts-ignore
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0].address);
          
          // Verificar que estamos en la red correcta
          const network = await provider.getNetwork();
          console.log("Red conectada:", network.name, "Chain ID:", network.chainId);
          
          if (network.chainId !== BigInt(NETWORK_CONFIG.SEPOLIA_CHAIN_ID)) {
            setStatus(`⚠️ Conecta a ${NETWORK_CONFIG.SEPOLIA_NAME} (Chain ID: ${NETWORK_CONFIG.SEPOLIA_CHAIN_ID})`);
          } else {
            setStatus("");
          }
        }
      }
    } catch (e) {
      console.log("Wallet no conectada");
    }
  }

  async function connectWallet() {
    try {
      // @ts-ignore
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        
        // Intentar cambiar a Sepolia
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }] // 11155111 en hex
          });
        } catch (e) {
          console.log("Error al cambiar a Sepolia:", e);
          // Si Sepolia no está agregada, intentar agregarla
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }]
            });
          } catch (addError) {
            console.log("Error al agregar Sepolia:", addError);
          }
        }

        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          
          // Verificar red después de conectar
          const network = await provider.getNetwork();
          if (network.chainId === BigInt(11155111)) {
            setStatus("✅ Conectado a Sepolia");
          } else {
            setStatus("⚠️ Conecta a Sepolia (Chain ID: 11155111)");
          }
          
          // Refresh token info after connecting
          if (tokenA.address) loadTokenInfo(tokenA.address, setTokenA);
          if (tokenB.address) loadTokenInfo(tokenB.address, setTokenB);
        }
      } else {
        setStatus("MetaMask no está instalado");
      }
    } catch (e: any) {
      setStatus(`Error al conectar wallet: ${e?.message || e}`);
    }
  }

  async function loadTokenInfo(address: string, setToken: React.Dispatch<React.SetStateAction<TokenInfo>>) {
    try {
      // Validate address format
      if (!ethers.isAddress(address)) {
        console.error("Dirección inválida:", address);
        return;
      }

      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const tokenContract = new ethers.Contract(address, ERC20ABI, provider);
      
      const [symbol, name] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name()
      ]);

      setToken(prev => ({
        ...prev,
        symbol,
        name
      }));

      // Load balance if wallet is connected
      try {
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const balance = await tokenContract.balanceOf(userAddress);
        setToken(prev => ({
          ...prev,
          balance: ethers.formatUnits(balance, 18)
        }));
      } catch (e) {
        // Wallet not connected, balance stays 0
        console.log("Wallet no conectada, balance se mantiene en 0");
      }
    } catch (e: any) {
      console.error("Error loading token info:", e?.message || e);
      // Set default values if token info can't be loaded
      setToken(prev => ({
        ...prev,
        symbol: "UNKNOWN",
        name: "Unknown Token",
        balance: "0"
      }));
    }
  }

  async function loadPoolInfo() {
    if (!tokenA.address || !tokenB.address) return;

    // Validate addresses
    if (!ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
      console.error("Direcciones de tokens inválidas para pool info");
      return;
    }

    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, provider);

      // Get reserves first
      const [reserveAWei, reserveBWei] = await contract.getReserves(tokenA.address, tokenB.address);
      const reserveA = ethers.formatUnits(reserveAWei, 18);
      const reserveB = ethers.formatUnits(reserveBWei, 18);
      
      // Check if there's liquidity
      if (reserveAWei === BigInt(0) && reserveBWei === BigInt(0)) {
        setPoolInfo({
          reserveA: "0",
          reserveB: "0",
          price: "0",
          totalLiquidity: "0"
        });
        return;
      }

      // Get price only if there's liquidity
      try {
        const price = await contract.getPrice(tokenA.address, tokenB.address);
        const priceFormatted = ethers.formatUnits(price, 18);
        const totalLiquidity = (parseFloat(reserveA) + parseFloat(reserveB)).toFixed(6);

        setPoolInfo({
          reserveA,
          reserveB,
          price: priceFormatted,
          totalLiquidity
        });
      } catch (e) {
        // If getPrice fails, still show reserves but with 0 price
        const totalLiquidity = (parseFloat(reserveA) + parseFloat(reserveB)).toFixed(6);
        setPoolInfo({
          reserveA,
          reserveB,
          price: "0",
          totalLiquidity
        });
      }
    } catch (e) {
      console.error("Error loading pool info:", e);
      setPoolInfo(null);
    }
  }

  async function calculateAmountOut() {
    if (!canSwap || !tokenA.address || !tokenB.address) {
      setStatus("Por favor ingresa las direcciones de los tokens");
      return;
    }

    // Validate addresses
    if (!ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
      setStatus("Direcciones de tokens inválidas");
      return;
    }

    setIsLoading(true);
    setStatus("Calculando cantidad de salida...");
    
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, provider);

      const amountInWei = ethers.parseUnits(amountIn, 18);

      // Check reserves first
      const [reserveAWei, reserveBWei] = await contract.getReserves(tokenA.address, tokenB.address);
      
      if (reserveAWei === BigInt(0) || reserveBWei === BigInt(0)) {
        setAmountOut("");
        setStatus("Sin liquidez para este par de tokens. Agrega liquidez primero.");
        return;
      }

      // Get price from the contract
      try {
        const price = await contract.getPrice(tokenA.address, tokenB.address);
        
        if (!price || price.toString() === "0") {
          setAmountOut("");
          setStatus("Sin liquidez para este par de tokens");
          return;
        }

        // Calculate amountOut = amountIn * price / 1e18
        const amountOutWei = (amountInWei * price) / ethers.parseUnits("1", 18);
        const amountOutFormatted = ethers.formatUnits(amountOutWei, 18);
        
        setAmountOut(amountOutFormatted);
        setStatus("");
      } catch (e) {
        setAmountOut("");
        setStatus("Error al calcular precio. Verifica que haya liquidez en el pool.");
      }
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al calcular cantidad de salida");
      setAmountOut("");
    } finally {
      setIsLoading(false);
    }
  }

  async function approveToken(tokenAddress: string, amount: bigint) {
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const erc20 = new ethers.Contract(tokenAddress, ERC20ABI, signer);
      
      const userAddress = await signer.getAddress();
      
      // Verificar que el contrato existe
      const code = await provider.getCode(tokenAddress);
      if (code === "0x") {
        throw new Error("Contrato de token no encontrado en la red");
      }
      
      // Verificar allowance con manejo de errores específico
      let allowance;
      try {
        allowance = await erc20.allowance(userAddress, contractAddress.SimpleSwap);
        // Asegurar que allowance sea un BigInt
        if (typeof allowance === 'string') {
          allowance = BigInt(allowance);
        } else if (typeof allowance === 'number') {
          allowance = BigInt(allowance);
        } else if (allowance && typeof allowance.toString === 'function') {
          allowance = BigInt(allowance.toString());
        } else {
          allowance = BigInt(0);
        }
      } catch (allowanceError: any) {
        console.error("Error al verificar allowance:", allowanceError);
        
        // Si el error es de decodificación o cualquier otro error, intentar aprobar directamente
        console.log("Error al verificar allowance, aprobando directamente...");
        const tx = await erc20.approve(contractAddress.SimpleSwap, amount);
        await tx.wait();
        console.log("Aprobación completada");
        return;
      }
      
      if (allowance < amount) {
        console.log(`Aprobando ${ethers.formatUnits(amount, 18)} tokens...`);
        const tx = await erc20.approve(contractAddress.SimpleSwap, amount);
        await tx.wait();
        console.log("Aprobación completada");
      } else {
        console.log("Allowance suficiente, no se necesita aprobación");
      }
    } catch (e: any) {
      console.error("Error en approveToken:", e);
      throw new Error(`Error al aprobar tokens: ${e?.message || e}`);
    }
  }

  async function executeSwap() {
    if (!canSwap || !tokenA.address || !tokenB.address) {
      setStatus("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setStatus("Ejecutando swap...");
    
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, signer);

      const amountInWei = ethers.parseUnits(amountIn, 18);
      const amountOutWei = ethers.parseUnits(amountOut, 18);
      
      // Calculate minimum amount out with slippage
      const slippageMultiplier = (100 - slippage) / 100;
      const slippageBigInt = BigInt(Math.floor(slippageMultiplier * 1000));
      const amountOutMin = (amountOutWei * slippageBigInt) / BigInt(1000);
      
      const path = [tokenA.address, tokenB.address];
      const to = await signer.getAddress();
      
      // Validate addresses are not ENS names
      if (!ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
        throw new Error("Direcciones de tokens inválidas");
      }
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

      // Approve token A
      await approveToken(tokenA.address, amountInWei);

      // Execute swap
      const tx = await contract.swapExactTokensForTokens(
        amountInWei,
        amountOutMin,
        path,
        to,
        deadline
      );
      
      await tx.wait();
      setStatus("¡Swap completado exitosamente!");
      
      // Clear inputs
      setAmountIn("");
      setAmountOut("");
      
      // Refresh balances and pool info
      if (tokenA.address) loadTokenInfo(tokenA.address, setTokenA);
      if (tokenB.address) loadTokenInfo(tokenB.address, setTokenB);
      await loadPoolInfo();
      
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al ejecutar el swap");
    } finally {
      setIsLoading(false);
    }
  }

  async function addLiquidity() {
    if (!canAddLiquidity || !tokenA.address || !tokenB.address) {
      setStatus("Por favor completa todos los campos de liquidez");
      return;
    }

    setIsLoading(true);
    setStatus("Agregando liquidez...");
    
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, signer);

      const amountAWei = ethers.parseUnits(liquidityAmountA, 18);
      const amountBWei = ethers.parseUnits(liquidityAmountB, 18);
      const to = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 300;

      // Validate addresses are not ENS names
      if (!ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
        throw new Error("Direcciones de tokens inválidas");
      }

      // Approve both tokens
      await approveToken(tokenA.address, amountAWei);
      await approveToken(tokenB.address, amountBWei);

      // Add liquidity
      const tx = await contract.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountAWei,
        amountBWei,
        0, // amountAMin
        0, // amountBMin
        to,
        deadline
      );
      
      await tx.wait();
      setStatus("¡Liquidez agregada exitosamente!");
      
      // Clear inputs
      setLiquidityAmountA("");
      setLiquidityAmountB("");
      
      // Refresh balances and pool info
      if (tokenA.address) loadTokenInfo(tokenA.address, setTokenA);
      if (tokenB.address) loadTokenInfo(tokenB.address, setTokenB);
      await loadPoolInfo();
      
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al agregar liquidez");
    } finally {
      setIsLoading(false);
    }
  }

  async function removeLiquidity() {
    if (!canRemoveLiquidity || !tokenA.address || !tokenB.address) {
      setStatus("Por favor completa todos los campos de remover liquidez");
      return;
    }

    setIsLoading(true);
    setStatus("Removiendo liquidez...");
    
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, signer);

      const liquidityAmountWei = ethers.parseUnits(removeLiquidityAmount, 18);
      const to = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 300;

      // Validate addresses are not ENS names
      if (!ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
        throw new Error("Direcciones de tokens inválidas");
      }

      // Remove liquidity
      const tx = await contract.removeLiquidity(
        tokenA.address,
        tokenB.address,
        liquidityAmountWei,
        0, // amountAMin
        0, // amountBMin
        to,
        deadline
      );
      
      await tx.wait();
      setStatus("¡Liquidez removida exitosamente!");
      
      // Clear inputs
      setRemoveLiquidityAmount("");
      
      // Refresh balances and pool info
      if (tokenA.address) loadTokenInfo(tokenA.address, setTokenA);
      if (tokenB.address) loadTokenInfo(tokenB.address, setTokenB);
      await loadPoolInfo();
      
    } catch (e: any) {
      setStatus(e?.reason || e?.message || "Error al remover liquidez");
    } finally {
      setIsLoading(false);
    }
  }

  function switchTokens() {
    const temp = { ...tokenA };
    setTokenA({ ...tokenB });
    setTokenB(temp);
    setAmountIn(amountOut);
    setAmountOut("");
  }

  // Nueva función para calcular el output real usando getAmountOut
  async function calcularOutputReal(amountInStr: string, tokenAAddress: string, tokenBAddress: string) {
    try {
      // @ts-ignore
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(contractAddress.SimpleSwap, SimpleSwapABI.abi, provider);
      // 1. Obtener reservas
      const [reserveA, reserveB] = await contract.getReserves(tokenAAddress, tokenBAddress);
      // 2. Parsear amountIn a wei
      const amountIn = ethers.parseUnits(amountInStr, 18);
      // 3. Llamar a getAmountOut
      const amountOut = await contract.getAmountOut(amountIn, reserveA, reserveB);
      // 4. Formatear a decimal para mostrar al usuario
      return ethers.formatUnits(amountOut, 18);
    } catch (e) {
      return "0";
    }
  }

  // Actualizar amountOut automáticamente cuando cambian los inputs
  useEffect(() => {
    async function updateAmountOut() {
      if (
        tokenA.address && tokenB.address &&
        amountIn !== "" &&
        ethers.isAddress(tokenA.address) &&
        ethers.isAddress(tokenB.address)
      ) {
        const out = await calcularOutputReal(amountIn, tokenA.address, tokenB.address);
        setAmountOut(out);
      } else {
        setAmountOut("");
      }
    }
    updateAmountOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountIn, tokenA.address, tokenB.address]);

  return (
    <div className="token-swap-container" style={{
      maxWidth: 800,
      margin: '20px auto',
      padding: 24,
      border: '1px solid #e0e0e0',
      borderRadius: 12,
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#333' }}>
        DEX - Swap y Liquidez
      </h2>

      {/* Wallet Connection */}
      <div style={{ 
        marginBottom: 24, 
        padding: 16, 
        backgroundColor: walletConnected ? '#d4edda' : '#f8d7da',
        borderRadius: 8,
        border: `1px solid ${walletConnected ? '#c3e6cb' : '#f5c6cb'}`
      }}>
        {walletConnected ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: STYLES.COLORS.SUCCESS, fontWeight: 'bold' }}>{SUCCESS_MESSAGES.WALLET_CONNECTED}</div>
            <div style={{ fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
              {walletAddress}
            </div>
            <button
              onClick={connectWallet}
              style={{
                marginTop: 8,
                padding: '4px 8px',
                backgroundColor: STYLES.COLORS.INFO,
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              {UI_LABELS.SWITCH_TO_SEPOLIA}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: STYLES.COLORS.DANGER, marginBottom: 8 }}>{ERROR_MESSAGES.WALLET_NOT_CONNECTED}</div>
            <button
              onClick={connectWallet}
              style={{
                padding: '8px 16px',
                backgroundColor: STYLES.COLORS.PRIMARY,
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {UI_LABELS.CONNECT_WALLET}
            </button>
          </div>
        )}
      </div>

      {/* Pool Information */}
      {poolInfo && (
        <div style={{
          marginBottom: 24,
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: 12, color: '#495057' }}>Información del Pool</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <strong>Reserva {tokenA.symbol}:</strong> {poolInfo.reserveA}
            </div>
            <div>
              <strong>Reserva {tokenB.symbol}:</strong> {poolInfo.reserveB}
            </div>
            <div>
              <strong>Precio ({tokenA.symbol}/{tokenB.symbol}):</strong> {poolInfo.price}
            </div>
            <div>
              <strong>Liquidez Total:</strong> {poolInfo.totalLiquidity}
            </div>
          </div>
          {parseFloat(poolInfo.totalLiquidity) === 0 && (
            <div style={{
              marginTop: 12,
              padding: 8,
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 4,
              color: '#856404'
            }}>
              💡 <strong>Sin liquidez:</strong> Agrega liquidez primero para poder hacer swaps.
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Swap Section */}
        <div>
          <h3 style={{ marginBottom: 16, color: '#333' }}>Swap de Tokens</h3>
          
          {/* Token A Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Token A (Input)
            </label>
            <input
              type="text"
              placeholder="Dirección del Token A (0x...)"
              value={tokenA.address}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow valid hex addresses or empty string
                if (value === "" || /^0x[a-fA-F0-9]{40}$/.test(value)) {
                  setTokenA(prev => ({ ...prev, address: value }));
                }
              }}
              style={{
                width: '100%',
                padding: 12,
                border: tokenA.address && !ethers.isAddress(tokenA.address) ? '1px solid #dc3545' : '1px solid #ddd',
                borderRadius: 8,
                marginBottom: 8
              }}
            />
            {tokenA.address && (
              <div style={{ fontSize: 14, color: '#666' }}>
                {ethers.isAddress(tokenA.address) ? (
                  <>
                    <div>Nombre: {tokenA.name}</div>
                    <div>Símbolo: {tokenA.symbol}</div>
                    <div>Balance: {tokenA.balance}</div>
                  </>
                ) : (
                  <div style={{ color: '#dc3545' }}>Dirección inválida</div>
                )}
              </div>
            )}
          </div>

          {/* Token B Output */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Token B (Output)
            </label>
            <input
              type="text"
              placeholder="Dirección del Token B (0x...)"
              value={tokenB.address}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow valid hex addresses or empty string
                if (value === "" || /^0x[a-fA-F0-9]{40}$/.test(value)) {
                  setTokenB(prev => ({ ...prev, address: value }));
                }
              }}
              style={{
                width: '100%',
                padding: 12,
                border: tokenB.address && !ethers.isAddress(tokenB.address) ? '1px solid #dc3545' : '1px solid #ddd',
                borderRadius: 8,
                marginBottom: 8
              }}
            />
            {tokenB.address && (
              <div style={{ fontSize: 14, color: '#666' }}>
                {ethers.isAddress(tokenB.address) ? (
                  <>
                    <div>Nombre: {tokenB.name}</div>
                    <div>Símbolo: {tokenB.symbol}</div>
                    <div>Balance: {tokenB.balance}</div>
                  </>
                ) : (
                  <div style={{ color: '#dc3545' }}>Dirección inválida</div>
                )}
              </div>
            )}
          </div>

          {/* Switch Button */}
          <button
            onClick={switchTokens}
            style={{
              width: '100%',
              padding: 8,
              marginBottom: 16,
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            🔄 Cambiar Tokens
          </button>

          {/* Amount Input */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Cantidad a Cambiar
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            />
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateAmountOut}
            disabled={!canSwap || isLoading}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 16,
              backgroundColor: canSwap ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: canSwap ? 'pointer' : 'not-allowed'
            }}
          >
            {isLoading ? 'Calculando...' : 'Calcular Cantidad de Salida'}
          </button>

          {/* Amount Output */}
          {amountOut && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Cantidad a Recibir
              </label>
              <input
                type="text"
                value={amountOut}
                readOnly
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  backgroundColor: '#f9f9f9'
                }}
              />
            </div>
          )}

          {/* Slippage Setting */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Slippage (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            />
          </div>

          {/* Execute Swap Button */}
          <button
            onClick={executeSwap}
            disabled={!canSwap || !amountOut || isLoading}
            style={{
              width: '100%',
              padding: 12,
              backgroundColor: canSwap && amountOut ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: canSwap && amountOut ? 'pointer' : 'not-allowed',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Ejecutando...' : 'Ejecutar Swap'}
          </button>
        </div>

        {/* Liquidity Section */}
        <div>
          <h3 style={{ marginBottom: 16, color: '#333' }}>Agregar Liquidez</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Cantidad {tokenA.symbol}
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={liquidityAmountA}
              onChange={(e) => setLiquidityAmountA(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Cantidad {tokenB.symbol}
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={liquidityAmountB}
              onChange={(e) => setLiquidityAmountB(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            />
          </div>

          <button
            onClick={addLiquidity}
            disabled={!canAddLiquidity || isLoading}
            style={{
              width: '100%',
              padding: 12,
              backgroundColor: canAddLiquidity ? '#17a2b8' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: canAddLiquidity ? 'pointer' : 'not-allowed',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Agregando...' : 'Agregar Liquidez'}
          </button>

          <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          <h3 style={{ marginBottom: 16, color: '#333' }}>Remover Liquidez</h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Cantidad de Liquidez a Remover
            </label>
            <input
              type="number"
              placeholder="0.0"
              value={removeLiquidityAmount}
              onChange={(e) => setRemoveLiquidityAmount(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 8
              }}
            />
          </div>

          <button
            onClick={removeLiquidity}
            disabled={!canRemoveLiquidity || isLoading}
            style={{
              width: '100%',
              padding: 12,
              backgroundColor: canRemoveLiquidity ? '#dc3545' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: canRemoveLiquidity ? 'pointer' : 'not-allowed',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Removiendo...' : 'Remover Liquidez'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          backgroundColor: status.includes('Error') ? '#f8d7da' : '#d4edda',
          color: status.includes('Error') ? '#721c24' : '#155724',
          border: `1px solid ${status.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
        }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default TokenSwap; 