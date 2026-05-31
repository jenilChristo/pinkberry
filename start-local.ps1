# Baby Chloe - Local Development Startup Script
# This script starts both the API backend and web frontend for local development

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Baby Chloe - Local Development" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if SQL LocalDB is available
Write-Host "Checking SQL LocalDB..." -ForegroundColor Yellow
$localdbInfo = SqlLocalDB info MSSQLLocalDB 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "SQL LocalDB is not installed or MSSQLLocalDB instance doesn't exist." -ForegroundColor Red
    Write-Host "Creating MSSQLLocalDB instance..." -ForegroundColor Yellow
    SqlLocalDB create MSSQLLocalDB
    SqlLocalDB start MSSQLLocalDB
}
else {
    Write-Host "SQL LocalDB is available." -ForegroundColor Green
    
    # Check if it's running
    if ($localdbInfo -match "State: .*Stopped") {
        Write-Host "Starting SQL LocalDB..." -ForegroundColor Yellow
        SqlLocalDB start MSSQLLocalDB
    }
}

Write-Host ""
Write-Host "Starting API Backend..." -ForegroundColor Yellow
Write-Host "Location: d:\cool apps\babychloe\app\api\src\BabyChloe.Api" -ForegroundColor Gray
Write-Host "URL: http://localhost:5000" -ForegroundColor Gray
Write-Host ""

# Start API in a new terminal
Start-Process powershell -ArgumentList @"
    -NoExit
    -Command `"
        Set-Location 'd:\cool apps\babychloe\app\api\src\BabyChloe.Api';
        Write-Host ''; 
        Write-Host '==================================' -ForegroundColor Cyan;
        Write-Host ' Baby Chloe API Backend' -ForegroundColor Cyan;
        Write-Host '==================================' -ForegroundColor Cyan;
        Write-Host '';
        Write-Host 'API URL: http://localhost:5000' -ForegroundColor Green;
        Write-Host 'Health: http://localhost:5000/health' -ForegroundColor Green;
        Write-Host '';
        Write-Host 'Database: SQL Server LocalDB' -ForegroundColor Yellow;
        Write-Host 'Cache: In-Memory' -ForegroundColor Yellow;
        Write-Host '';
        Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray;
        Write-Host '';
        dotnet run
    `"
"@

# Wait a bit for API to start
Write-Host "Waiting for API to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Starting Web Frontend..." -ForegroundColor Yellow
Write-Host "Location: d:\cool apps\babychloe\web" -ForegroundColor Gray
Write-Host "URL: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Start Web in a new terminal
Start-Process powershell -ArgumentList @"
    -NoExit
    -Command `"
        Set-Location 'd:\cool apps\babychloe\web';
        Write-Host ''; 
        Write-Host '==================================' -ForegroundColor Cyan;
        Write-Host ' Baby Chloe Web Frontend' -ForegroundColor Cyan;
        Write-Host '==================================' -ForegroundColor Cyan;
        Write-Host '';
        Write-Host 'Web URL: http://localhost:5173' -ForegroundColor Green;
        Write-Host 'API URL: http://localhost:5000' -ForegroundColor Green;
        Write-Host '';
        Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray;
        Write-Host '';
        npm run dev
    `"
"@

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " Baby Chloe Started Successfully!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  API:  http://localhost:5000" -ForegroundColor White
Write-Host "  Web:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Database:" -ForegroundColor Cyan
Write-Host "  SQL Server LocalDB (BabyChloe)" -ForegroundColor White
Write-Host "  Seeded with sample data" -ForegroundColor White
Write-Host ""
Write-Host "Sample Data:" -ForegroundColor Cyan
Write-Host "  - 1 Family (Johnson Family)" -ForegroundColor White
Write-Host "  - 2 Caregivers (Sarah & Mike)" -ForegroundColor White
Write-Host "  - 1 Baby (Chloe, 3 months old)" -ForegroundColor White
Write-Host "  - 18 Feeding records" -ForegroundColor White
Write-Host "  - 12 Sleep records" -ForegroundColor White
Write-Host "  - 24 Diaper changes" -ForegroundColor White
Write-Host "  - 4 Growth measurements" -ForegroundColor White
Write-Host "  - 3 Cry analysis records" -ForegroundColor White
Write-Host ""
Write-Host "To stop the services, close the PowerShell windows or press Ctrl+C in each." -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
