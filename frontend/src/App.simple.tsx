import React from 'react';
import TestComponent from './TestComponent';

function App() {
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
        <TestComponent />
        
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          margin: '20px auto',
          maxWidth: '600px'
        }}>
          <h3>🚀 Próximos pasos:</h3>
          <ol style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>Conectar MetaMask</li>
            <li>Cambiar a Sepolia Testnet</li>
            <li>Obtener ETH de prueba</li>
            <li>¡Empezar a hacer swaps!</li>
          </ol>
        </div>
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
      </footer>
    </div>
  );
}

export default App;