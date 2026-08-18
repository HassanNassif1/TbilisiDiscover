# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path "src\components\auth"
New-Item -ItemType Directory -Force -Path "src\components\common"
New-Item -ItemType Directory -Force -Path "src\context"
New-Item -ItemType Directory -Force -Path "src\services"
New-Item -ItemType Directory -Force -Path "src\styles"
New-Item -ItemType Directory -Force -Path "src\pages\admin"

Write-Host "✅ Directories created"

# Create empty files for components that need content
$files = @(
    "src\components\auth\ProtectedRoute.jsx",
    "src\components\common\LoadingSpinner.jsx",
    "src\context\AuthContext.jsx",
    "src\context\ThemeContext.jsx",
    "src\services\api.js",
    "src\styles\index.css"
)

foreach ($file in $files) {
    if (-not (Test-Path $file)) {
        New-Item -Path $file -ItemType File -Force
        Write-Host "✅ Created: $file"
    }
}

Write-Host "`n✅ All files created!"
Write-Host "📝 Copy the content from the code above into each file."