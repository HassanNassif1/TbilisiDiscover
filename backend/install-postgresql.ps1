Write-Host "🚀 PostgreSQL Setup Helper" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is installed
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue

if ($pgInstalled) {
    Write-Host "✅ PostgreSQL is installed!" -ForegroundColor Green
    
    # Check if service is running
    $service = Get-Service -Name postgresql-x64-15 -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq 'Running') {
        Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL service is not running. Starting it..." -ForegroundColor Yellow
        Start-Service -Name postgresql-x64-15
    }
    
    # Create database
    Write-Host "📦 Creating database..." -ForegroundColor Yellow
    & psql -U postgres -c "CREATE DATABASE discover_tbilisi;" 2>$null
    
    Write-Host ""
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. cd backend" -ForegroundColor White
    Write-Host "2. npm run dev" -ForegroundColor White
} else {
    Write-Host "❌ PostgreSQL is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Please install PostgreSQL:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "2. Install with password: 123" -ForegroundColor White
    Write-Host "3. Port: 5432" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
}