import TokenSwap from "./components/TokenSwap";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0', color: '#333' }}>
        Uniswap Simple DEX
      </h1>
      <TokenSwap />
    </div>
  );
}

export default App;
