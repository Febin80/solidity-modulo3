#!/bin/bash

echo "🚀 Configuración para Sepolia Testnet"
echo "======================================"

# Verificar si .env existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Configuración para Sepolia Testnet
# Reemplaza con tus valores reales

# Alchemy API Key - Obtén de https://www.alchemy.com/
ALCHEMY_API_KEY=tu_alchemy_api_key_aqui

# Private Key de tu wallet - ¡NUNCA compartas esta clave!
SEPOLIA_PRIVATE_KEY=tu_private_key_aqui

# Etherscan API Key - Obtén de https://etherscan.io/
ETHERSCAN_API_KEY=tu_etherscan_api_key_aqui
EOF
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "📋 Pasos para completar la configuración:"
echo "1. Edita el archivo .env con tus valores reales"
echo "2. Obtén tu API key de Alchemy: https://www.alchemy.com/"
echo "3. Exporta tu private key de MetaMask"
echo "4. (Opcional) Obtén tu API key de Etherscan"
echo ""
echo "🔧 Para desplegar en Sepolia:"
echo "npx hardhat run scripts/deploy-sepolia.js --network sepolia"
echo ""
echo "🌊 Para agregar liquidez:"
echo "npx hardhat run scripts/add-liquidity-sepolia.js --network sepolia"
echo ""
echo "🔍 Para verificar la configuración:"
echo "npx hardhat run scripts/verify-setup.js --network sepolia" 