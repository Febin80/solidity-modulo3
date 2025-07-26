#!/bin/bash

echo "🚀 Desplegando SimpleSwap DEX Frontend..."

# Verificar que estamos en el directorio correcto
if [ ! -d "frontend" ]; then
    echo "❌ Error: No se encuentra el directorio frontend"
    exit 1
fi

# Cambiar al directorio frontend
cd frontend

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Construyendo la aplicación..."
npm run build

echo "✅ Build completado!"
echo "📁 Los archivos están en: frontend/build/"

# Verificar que el build fue exitoso
if [ -d "build" ]; then
    echo "🎉 ¡Build exitoso! Listo para desplegar."
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Instala Vercel CLI: npm i -g vercel"
    echo "2. Ejecuta: vercel --prod"
    echo "3. O sube el contenido de frontend/build/ a Netlify"
else
    echo "❌ Error en el build"
    exit 1
fi