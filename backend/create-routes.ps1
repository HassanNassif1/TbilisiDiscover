# Create all route files
$routes = @(
    "userRoutes",
    "categoryRoutes", 
    "locationRoutes",
    "subscriptionRoutes",
    "paymentRoutes",
    "analyticsRoutes",
    "searchRoutes",
    "reviewRoutes",
    "eventRoutes",
    "dealRoutes"
)

foreach ($route in $routes) {
    $filePath = "src\routes\$route.js"
    if (-not (Test-Path $filePath)) {
        New-Item -Path $filePath -ItemType File -Force
        Write-Host "Created: $route.js"
    } else {
        Write-Host "Exists: $route.js"
    }
}

Write-Host "`n✅ All route files created!"
Write-Host "📝 Now copy the content for each route from above."