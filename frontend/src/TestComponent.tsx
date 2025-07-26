import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      margin: '20px auto',
      maxWidth: '600px'
    }}>
      <h2 style={{ color: '#333', textAlign: 'center' }}>
        ✅ Frontend funcionando correctamente
      </h2>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Si puedes ver este mensaje, el despliegue está funcionando.
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2d5a2d' }}>
            🌐 Red
          </h3>
          <p style={{ margin: 0, color: '#2d5a2d' }}>
            Sepolia Testnet
          </p>
        </div>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f0ff', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1a4480' }}>
            🔗 Estado
          </h3>
          <p style={{ margin: 0, color: '#1a4480' }}>
            Conectado
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;