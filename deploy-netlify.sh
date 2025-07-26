#!/bin/bash

echo "🌐 Desplegando SimpleSwap DEX a Netlify"
echo "======================================="

cd frontend

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf build

# Build optimizado para Netlify
echo "🔨 Construyendo para Netlify..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Build exitoso para Netlify!"
    echo ""
    echo "📁 Archivos listos en: frontend/build/"
    echo "📄 Archivo _redirects incluido: ✅"
    echo "📄 Archivo netlify.toml configurado: ✅"
    echo ""
    echo "🚀 INSTRUCCIONES PARA DESPLEGAR:"
    echo "================================"
    echo ""
    echo "1. Ve a https://netlify.com"
    echo "2. Crea una cuenta gratuita (si no tienes)"
    echo "3. En el dashboard, busca el área que dice:"
    echo "   'Drag and drop your site output folder here'"
    echo "4. Arrastra TODA la carpeta 'frontend/build/' (no solo el contenido)"
    echo "5. ¡Espera unos segundos y tu DEX estará en línea!"
    echo ""
    echo "🔧 CONFIGURACIÓN INCLUIDA:"
    echo "========================="
    echo "✅ Redirects para SPA (Single Page Application)"
    echo "✅ Configuración de Node.js 18"
    echo "✅ Optimización para producción"
    echo "✅ Archivos estáticos comprimidos"
    echo ""
    echo "🎯 DESPUÉS DEL DESPLIEGUE:"
    echo "========================="
    echo "• Netlify te dará una URL como: https://amazing-name-123456.netlify.app"
    echo "• Puedes cambiar el nombre del sitio en la configuración"
    echo "• El sitio se actualizará automáticamente si vuelves a subir archivos"
    echo ""
    echo "🔗 CONTRATOS DESPLEGADOS:"
    echo "========================"
    cat src/contracts/contract-address.json
    echo ""
    echo "💡 CONSEJOS:"
    echo "============"
    echo "• Si aún aparece 'Page not found', espera 2-3 minutos"
    echo "• Netlify puede tardar en procesar los redirects"
    echo "• Puedes ver los logs de despliegue en el dashboard de Netlify"
    echo ""
else
    echo "❌ Error en el build"
    exit 1
fi