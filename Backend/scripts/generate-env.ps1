param(
    [switch]$Force
)

<#
.SYNOPSIS
    Genera el archivo .env desde .env.example con SECRET_KEY aleatoria.
.DESCRIPTION
    Cada desarrollador ejecuta esto UNA VEZ al clonar el repo.
    Crea Backend/.env con una SECRET_KEY criptográficamente segura.
.PARAMETER Force
    Sobrescribe el .env existente sin preguntar.
.EXAMPLE
    powershell -File scripts/generate-env.ps1
    powershell -File scripts/generate-env.ps1 -Force
#>

$envExamplePath = Resolve-Path (Join-Path $PSScriptRoot "..\.env.example")
$envPath = Join-Path $PSScriptRoot "..\.env"

if (-not (Test-Path $envExamplePath)) {
    Write-Error "No se encuentra .env.example en $envExamplePath"
    exit 1
}

if (Test-Path $envPath) {
    if (-not $Force) {
        $overwrite = Read-Host "Ya existe un .env. ¿Sobrescribirlo? (s/N)"
        if ($overwrite -ne "s") {
            Write-Host "Cancelado. El .env actual no se modificó." -ForegroundColor Yellow
            exit 0
        }
    }
}

# Generar SECRET_KEY usando Python (criptográficamente segura)
$secretKey = python -c "import secrets; print(secrets.token_hex(32))"

# Leer .env.example, reemplazar SECRET_KEY, escribir .env
(Get-Content $envExamplePath) -replace '^SECRET_KEY=.*', "SECRET_KEY=$secretKey" | Set-Content $envPath

Write-Host ".env generado exitosamente con SECRET_KEY aleatoria." -ForegroundColor Green
Write-Host "Revisá las credenciales de BD en .env antes de arrancar." -ForegroundColor Cyan
