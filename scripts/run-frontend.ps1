# ============================================================
# Guarda360° — Script de execução do Frontend (Step 14)
# ============================================================
# Uso: .\scripts\run-frontend.ps1
# Abre o frontend em http://localhost:3000
# ============================================================

$frontendPath = "$PSScriptRoot\..\frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "  Guarda360° — Frontend (Step 14/15)" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Verificar Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Node.js não encontrado. Instale em https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green

# Verificar dependências
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
}

# Iniciar frontend
Write-Host ""
Write-Host "▶ Iniciando Guarda360° Frontend..." -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3000" -ForegroundColor White
Write-Host "  Dados: Mock (sem backend necessário)" -ForegroundColor White
Write-Host ""
Write-Host "Para parar: Ctrl+C" -ForegroundColor Gray
Write-Host ""

Set-Location $frontendPath
npm run dev
