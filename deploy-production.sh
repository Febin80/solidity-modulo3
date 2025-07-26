#!/bin/bash

echo "🚀 Desplegando SimpleSwap DEX - Versión de Producción"
echo "=================================================="

cd frontend

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf build

# Verificar que tenemos las dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias..."
    npm install
fi

# Verificar que tenemos los contratos
echo "🔍 Verificando contratos desplegados..."
if [ ! -f "src/contracts/contract-address.json" ]; then
    echo "❌ Error: No se encontraron las direcciones de contratos"
    echo "💡 Asegúrate de haber desplegado los contratos primero"
    exit 1
fi

# Mostrar direcciones de contratos
echo "📋 Direcciones de contratos:"
cat src/contracts/contract-address.json

# Build de producción
echo ""
echo "🔨 Construyendo aplicación de producción..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Build de producción exitoso!"
    echo "📁 Archivos listos en: frontend/build/"
    echo ""
    echo "📊 Tamaño del build:"
    du -sh build/
    echo ""
    echo "🌐 Para probar localmente:"
    echo "   cd frontend"
    echo "   npx serve -s build -p 3000"
    echo ""
    echo "🚀 Para desplegar:"
    echo "   1. Netlify: Ve a netlify.com y arrastra la carpeta 'build'"
    echo "   2. Vercel: Ve a vercel.com y arrastra la carpeta 'build'"
    echo ""
    echo "🔗 URLs de tu DEX después del despliegue:"
    echo "   - Netlify: https://tu-sitio.netlify.app"
    echo "   - Vercel: https://tu-sitio.vercel.app"
    echo ""
    echo "🎯 Funcionalidades incluidas:"
    echo "   ✅ Conexión con MetaMask"
    echo "   ✅ Intercambio de tokens (Swap)"
    echo "   ✅ Agregar liquidez"
    echo "   ✅ Remover liquidez"
    echo "   ✅ Visualización de pools"
    echo "   ✅ Cálculo automático de precios"
    echo "   ✅ Integración con Sepolia Testnet"
else
    echo "❌ Error en el build de producción"
    exit 1
fi