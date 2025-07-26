#!/bin/bash

echo "🔧 Preparando build para despliegue..."

cd frontend

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf build

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Usar versión simple para testing
echo "🧪 Usando versión de prueba..."
cp src/App.simple.tsx src/App.tsx

# Build
echo "🔨 Construyendo aplicación..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
    echo "📁 Archivos listos en: frontend/build/"
    echo ""
    echo "🌐 Para probar localmente:"
    echo "   npx serve -s build -p 3000"
    echo ""
    echo "🚀 Para desplegar:"
    echo "   1. Ve a netlify.com"
    echo "   2. Arrastra la carpeta 'build'"
    echo "   3. ¡Listo!"
else
    echo "❌ Error en el build"
    exit 1
fi