@echo off
chcp 65001 > nul
title Guarda360° — Frontend (Mock Mode)

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║        Guarda360° — Frontend Dev Server          ║
echo  ║        Modo: MOCK  ^|  Porta: 3000               ║
echo  ╚══════════════════════════════════════════════════╝
echo.

cd /d "%~dp0frontend"

:: Verificar se node_modules existe
if not exist "node_modules\" (
    echo  [1/2] Instalando dependencias...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
    echo.
) else (
    echo  [OK] Dependencias ja instaladas.
)

echo  [2/2] Iniciando servidor de desenvolvimento...
echo.
echo  URL: http://localhost:3000
echo  Login: qualquer e-mail + senha
echo  Usuario mock: Maria Silva (Responsavel 1)
echo.

set VITE_MOCK=true
call npm run dev

pause
