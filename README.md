# Uniswap Simple DEX - Sepolia Testnet

Un DEX (Decentralized Exchange) simple inspirado en Uniswap desplegado en Sepolia testnet.

## 🚀 Características

- ✅ **Swap de tokens** (Input → Output)
- ✅ **Agregar liquidez** a pools
- ✅ **Ver precio** en tiempo real
- ✅ **Información del pool** (reservas, liquidez total)
- ✅ **Validación de direcciones** (sin errores ENS)
- ✅ **Slippage configurable**
- ✅ **Interfaz moderna** y fácil de usar

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- MetaMask
- Alchemy API Key
- ETH de Sepolia (gratis)

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd uniswap
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```

## 🏗️ Configuración

### 1. Configuración inicial:

```bash
./setup-sepolia.sh
```

### 2. Configurar variables de entorno:

Edita el archivo `.env` creado:

```bash
# Alchemy API Key - Obtén de https://www.alchemy.com/
ALCHEMY_API_KEY=tu_alchemy_api_key_aqui

# Private Key de tu wallet - ¡NUNCA compartas esta clave!
SEPOLIA_PRIVATE_KEY=tu_private_key_aqui

# Etherscan API Key - Obtén de https://etherscan.io/
ETHERSCAN_API_KEY=tu_etherscan_api_key_aqui
```

### 3. Desplegar contratos:

```bash
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

### 4. Agregar liquidez:

```bash
npx hardhat run scripts/add-liquidity-sepolia.js --network sepolia
```

### 5. Iniciar frontend:

```bash
cd frontend
npm start
```

## 🎯 Uso

### Conectar Wallet

1. **Configurar MetaMask para Sepolia:**
   - Network Name: `Sepolia Testnet`
   - RPC URL: `https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`

2. **Obtener ETH de Sepolia:**
   - Ve a [Sepolia Faucet](https://sepoliafaucet.com/)
   - Solicita ETH gratis

3. **Conectar wallet:**
   - Abre `http://localhost:3000`
   - Haz clic en "Conectar Wallet"
   - Confirma en MetaMask

### Agregar Liquidez

1. Ve a la sección "Agregar Liquidez"
2. Ingresa las cantidades de Token A y Token B
3. Haz clic en "Agregar Liquidez"
4. Confirma la transacción en MetaMask

### Hacer Swap

1. Ve a la sección "Swap de Tokens"
2. Las direcciones de los tokens ya están pre-cargadas
3. Ingresa la cantidad que quieres cambiar
4. Haz clic en "Calcular Cantidad de Salida"
5. Revisa el precio y la cantidad a recibir
6. Haz clic en "Ejecutar Swap"
7. Confirma la transacción en MetaMask

## 📊 Contratos Desplegados

Los contratos se desplegarán automáticamente en Sepolia y las direcciones se guardarán en:
- `frontend/src/contracts/contract-address.json`
- `frontend/src/config/tokens.ts`

## 🔧 Scripts Disponibles

- `scripts/deploy-sepolia.js` - Despliega en Sepolia
- `scripts/add-liquidity-sepolia.js` - Agrega liquidez
- `scripts/verify-setup.js` - Verifica la configuración
- `setup-sepolia.sh` - Configuración inicial

## 🐛 Solución de Problemas

### Error "Contrato de token no encontrado en la red"

**Causa:** No estás conectado a Sepolia o los contratos no están desplegados.

**Solución:**
1. Verifica que estés en Sepolia (Chain ID: 11155111)
2. Ejecuta el script de despliegue: `npx hardhat run scripts/deploy-sepolia.js --network sepolia`
3. Refresca la página

### Error "could not decode result data"

**Causa:** Problemas con el ABI o contratos no desplegados.

**Solución:**
1. Verifica que los contratos estén desplegados
2. Asegúrate de estar en Sepolia
3. Refresca la página

### Error "insufficient funds"

**Solución:**
1. Obtén ETH de [Sepolia Faucet](https://sepoliafaucet.com/)
2. Verifica que tengas suficientes tokens minted

## 📁 Estructura del Proyecto

```
uniswap/
├── contracts/
│   ├── simple.sol          # Contrato principal SimpleSwap
│   └── token.sol           # Contrato de token ERC20
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── TokenSwap.tsx  # Componente principal
│   │   ├── config/
│   │   │   └── tokens.ts      # Configuración de tokens
│   │   └── contracts/
│   │       └── contract-address.json
│   └── package.json
├── scripts/
│   ├── deploy-sepolia.js
│   ├── add-liquidity-sepolia.js
│   └── verify-setup.js
├── setup-sepolia.sh
└── hardhat.config.js
```

## 🔗 Enlaces Útiles

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy](https://www.alchemy.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [MetaMask](https://metamask.io/)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- Inspirado en Uniswap V2
- Construido con Hardhat y React
- Usando ethers.js para interacción con blockchain
