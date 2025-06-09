# Script to get insurance quotes with support for both existing and new cars

# Prompt for car type
$carType = Read-Host "Do you want to get quotes for a new car? (y/n)"
$isNewCar = $carType.ToLower() -eq 'y'

# Variables for request
$phone = "9602089889"
$isPolicyExpired = $false
$hasMadeClaim = $false

# Create request body based on car type
if ($isNewCar) {
    Write-Host "Getting quotes for a NEW car. You'll be prompted during the scraping process." -ForegroundColor Yellow
    
    # For new cars, we don't need registration number upfront
    $body = @{
        phoneNumber = $phone
        isNewCar = $true
        isPolicyExpired = $isPolicyExpired
        hasMadeClaim = $hasMadeClaim
    } | ConvertTo-Json
} 
else {
    # For existing cars, prompt for registration number
    $registration = Read-Host "Enter car registration number (e.g. RJ14QC8065)"
    
    if ([string]::IsNullOrWhiteSpace($registration)) {
        $registration = "RJ14QC8065" # Default value if nothing entered
        Write-Host "Using default registration: $registration" -ForegroundColor Yellow
    }
    
    # Use carReg instead of registrationNumber to match API expectations
    $body = @{
        carReg = $registration     # Changed from registrationNumber to carReg
        phoneNumber = $phone
        isNewCar = $false
        isPolicyExpired = $isPolicyExpired
        hasMadeClaim = $hasMadeClaim
    } | ConvertTo-Json
}

Write-Host "`nSending request to get insurance quotes..." -ForegroundColor Cyan
Write-Host "Request details: $body" -ForegroundColor Gray

# Rest of the script remains unchanged
try {
    # Make API request
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/quotes" -ContentType "application/json" -Body $body -ErrorAction Stop

    # Display header
    if ($isNewCar) {
        Write-Host "`n===== INSURANCE QUOTES FOR NEW CAR =====`n" -ForegroundColor Cyan
    } else {
        Write-Host "`n===== INSURANCE QUOTES FOR $($response.vehicleRegistration) =====`n" -ForegroundColor Cyan
    }

    # Display total quotes found
    Write-Host "Total quotes found: $($response.totalQuotes)" -ForegroundColor Green
    Write-Host "----------------------------------------`n"

    # Display each quote in a readable format with nested details
    foreach ($quote in $response.quotes) {
        Write-Host "QUOTE #$($quote.quoteNumber)" -ForegroundColor Yellow
        Write-Host "  Insurer: $($quote.insurer)"
        Write-Host "  Premium: $($quote.premium)" 
        Write-Host "  IDV: $($quote.idv)"
        Write-Host "  Plan Type: $($quote.planType)"
        
        # Display details if available
        if ($quote.details) {
            Write-Host "`n  DETAILED INFORMATION:" -ForegroundColor Magenta
            
            # Display NCB if available
            if ($quote.details.ncb) {
                Write-Host "  NCB: $($quote.details.ncb)"
            }
            
            # Display coverages
            if ($quote.details.coverages -and $quote.details.coverages.Count -gt 0) {
                Write-Host "`n  Coverages:" -ForegroundColor Green
                foreach ($coverage in $quote.details.coverages) {
                    Write-Host "    • $coverage"
                }
            }
            
            # Display exclusions
            if ($quote.details.exclusions -and $quote.details.exclusions.Count -gt 0) {
                Write-Host "`n  Exclusions:" -ForegroundColor Red
                foreach ($exclusion in $quote.details.exclusions) {
                    Write-Host "    • $exclusion"
                }
            }
            
            # Display premium breakup if available
            if ($quote.details.premiumBreakup -and $quote.details.premiumBreakup.Count -gt 0) {
                Write-Host "`n  Premium Breakup:" -ForegroundColor Cyan
                foreach ($item in $quote.details.premiumBreakup) {
                    Write-Host "    $($item.label): $($item.value)"
                }
            }
        }
        
        Write-Host "`n----------------------------------------`n"
    }
}
catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    # Show more detailed error information
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        }
        catch {
            Write-Host "Could not read response body: $_" -ForegroundColor Red
        }
    }
}