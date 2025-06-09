# Run-SundayInsurance.ps1
# Helper script to run the SundayInsurance project

# Show the logo
Write-Host "
   _____                 _              _____                                          
  / ____|               | |            |_   _|                                         
 | (___  _   _ _ __   __| | __ _ _   _   | |  _ __  ___ _   _ _ __ __ _ _ __   ___ ___ 
  \___ \| | | | '_ \ / _` |/ _` | | | |  | | | '_ \/ __| | | | '__/ _` | '_ \ / __/ _ \
  ____) | |_| | | | | (_| | (_| | |_| | _| |_| | | \__ \ |_| | | | (_| | | | | (_|  __/
 |_____/ \__,_|_| |_|\__,_|\__,_|\__, ||_____|_| |_|___/\__,_|_|  \__,_|_| |_|\___\___|
                                  __/ |                                                
                                 |___/                                                 
" -ForegroundColor Cyan

Write-Host "Welcome to SundayInsurance - Smart Insurance Comparison Platform" -ForegroundColor Yellow
Write-Host "This script will help you run the insurance scraper for both new and existing cars`n" -ForegroundColor Green

# Function to start the server
function Start-ScraperServer {
    Write-Host "Starting the insurance scraper server..." -ForegroundColor Cyan
    
    # Check if the server is already running
    $isRunning = $false
    try {
        $testConnection = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
        $isRunning = $true
    } catch {
        $isRunning = $false
    }
    
    if ($isRunning) {
        Write-Host "Server is already running on port 3000" -ForegroundColor Green
        return
    }
    
    # Start the server in a new window
    Start-Process powershell -ArgumentList "-Command `"cd 'd:\Downloads\insurance-scraper'; npm run dev`"" -WindowStyle Normal
    
    Write-Host "Waiting for the server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 7
    
    # Verify if server started
    try {
        $testConnection = Invoke-RestMethod -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
        Write-Host "Server is now running on port 3000" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not verify if server is running. This may be normal if the API endpoint is not available on the root path." -ForegroundColor Yellow
    }
}

# Function to run the client script
function Get-InsuranceQuotes {
    param (
        [string]$CarType,
        [string]$RegistrationNumber = ""
    )
    
    # Set up parameters for the PowerShell script
    $parameters = @{}
    
    if ($CarType -eq "new") {
        $parameters.IsNewCar = $true
    } else {
        $parameters.IsNewCar = $false
        if ($RegistrationNumber) {
            $parameters.RegistrationNumber = $RegistrationNumber
        }
    }
    
    # Create a temporary script with pre-filled parameters
    $tempScriptPath = "d:\Downloads\insurance-scraper\temp-script.ps1"
    
    # Read the original script
    $originalScript = Get-Content -Path "d:\Downloads\insurance-scraper\get-quotes.ps1" -Raw
    
    # Modify it to skip the prompt
    if ($CarType -eq "new") {
        $modifiedScript = $originalScript -replace '(\$carType = Read-Host "Do you want to get quotes for a new car\? \(y/n\)")', '$carType = "y"'
    } else {
        $modifiedScript = $originalScript -replace '(\$carType = Read-Host "Do you want to get quotes for a new car\? \(y/n\)")', '$carType = "n"'
        if ($RegistrationNumber) {
            $modifiedScript = $modifiedScript -replace '(\$registration = Read-Host "Enter car registration number \(e.g. RJ14QC8065\)")', "`$registration = `"$RegistrationNumber`""
        }
    }
    
    # Write the modified script
    Set-Content -Path $tempScriptPath -Value $modifiedScript
    
    # Run the script
    Write-Host "`nRunning the quote scraper..." -ForegroundColor Cyan
    & $tempScriptPath
    
    # Clean up
    Remove-Item -Path $tempScriptPath -Force
}

# Main menu
function Show-Menu {
    Write-Host "`n======== MENU ========" -ForegroundColor Magenta
    Write-Host "1. Start Server" -ForegroundColor Yellow
    Write-Host "2. Get Quotes for New Car" -ForegroundColor Yellow
    Write-Host "3. Get Quotes for Existing Car" -ForegroundColor Yellow
    Write-Host "4. Exit" -ForegroundColor Yellow
    Write-Host "=====================`n" -ForegroundColor Magenta
    
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        "1" {
            Start-ScraperServer
            Show-Menu
        }
        "2" {
            Get-InsuranceQuotes -CarType "new"
            Show-Menu
        }
        "3" {
            $regNumber = Read-Host "Enter car registration number (leave blank for default)"
            Get-InsuranceQuotes -CarType "existing" -RegistrationNumber $regNumber
            Show-Menu
        }
        "4" {
            Write-Host "Exiting..." -ForegroundColor Cyan
            exit
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Show-Menu
        }
    }
}

# Start the menu
Write-Host "First, make sure you've installed dependencies with 'npm install'" -ForegroundColor Yellow
Show-Menu
