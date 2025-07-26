import React, { useState, useEffect } from 'react';
import TokenSwap from "./components/TokenSwap";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Cargando SimpleSwap DEX...</h2>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        color: 'red'
      }}>
        <h2>Error: {error}</h2>
        <button onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          margin: '0', 
          color: '#333',
          fontSize: '2.5rem'
        }}>
          🔄 SimpleSwap DEX
        </h1>
        <p style={{ 
          textAlign: 'center', 
          margin: '10px 0 0 0', 
          color: '#666',
          fontSize: '1.1rem'
        }}>
          Intercambia tokens en Sepolia Testnet
        </p>
      </header>
      
      <main style={{ padding: '0 20px' }}>
        <TokenSwap />
      </main>
      
      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px', 
        color: '#888',
        borderTop: '1px solid #eee',
        marginTop: '40px'
      }}>
        <p>SimpleSwap DEX - Construido con React y Solidity</p>
        <p>Red: Sepolia Testnet</p>
        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
          Contratos desplegados en Sepolia - 
          <a href="https://sepolia.etherscan.io/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            Ver en Etherscan
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;