# SundayInsurance: Smart Vehicle Insurance Platform - Running Guide

This guide explains how to run the SundayInsurance project for both new and existing cars.

## Prerequisites

1. Node.js (installed)
2. Project dependencies installed (`npm install`)

## Starting the Server

1. Open a terminal window in the project directory
2. Run the following command:
   ```
   npm run dev
   ```
3. Wait for the server to start (it will show "Server running on port 3000")

## Running the PowerShell Client Script

The project includes a PowerShell script (`get-quotes.ps1`) that lets you interact with the insurance scraper. This script supports both new car and existing car flows.

### For New Cars

1. Run the script:
   ```
   .\get-quotes.ps1
   ```

2. When prompted "Do you want to get quotes for a new car? (y/n)", enter `y`

3. The script will connect to the API and start the scraping process

4. You'll be prompted in the terminal to select:
   - Car manufacturer
   - Car model
   - Fuel type
   - Car variant
   - Registration place (RTO)

5. **Important: Registration Year Selection**
   - After selecting the registration place, you'll see a dropdown for registration year
   - If the dropdown doesn't appear automatically, look for any selectable field labeled with years
   - If you encounter the error about ".w--radio--fl-expiry" selector, it means the registration year was not properly detected
   - In this case, you may need to restart the process and carefully follow each prompt

6. After completing all steps, the system will:
   - Fill in your phone number (pre-configured in the script)
   - Select policy expiry status (configurable in the script)
   - Select claim status (configurable in the script)
   - View and extract quotes

### For Existing Cars

1. Run the script:
   ```
   .\get-quotes.ps1
   ```

2. When prompted "Do you want to get quotes for a new car? (y/n)", enter `n`

3. Enter your car's registration number when prompted
   - If you don't enter anything, it will use a default value (RJ14QC8065)

4. The script will:
   - Submit the registration number to the API
   - The scraper will automatically fetch car details
   - Set policy expiry and claim status (configurable in the script)
   - Extract and display quotes

## Common Issues and Troubleshooting

### Registration Year Dropdown Not Detected

If you encounter issues with the registration year dropdown:

1. Make sure the server is running properly (`npm run dev`)
2. Try selecting a different registration place
3. If the dropdown appears but isn't recognized by the script, you may need to manually click it
4. The error message "No element found for selector: .w--radio--fl-expiry" typically occurs when the flow doesn't transition correctly after the registration year selection

### Connection Issues

If you see "Unable to connect to the remote server":

1. Verify the server is running (you should see "Server running on port 3000")
2. Check if there are any TypeScript compilation errors
3. Restart the server if necessary

### Slow or Incomplete Results

The scraping process involves navigating through multiple pages and can be slow:

1. Be patient during the scraping process
2. Ensure you have a stable internet connection
3. If the process seems stuck, check the terminal where the server is running for any error messages

## Configuration Options

You can modify these parameters in the `get-quotes.ps1` script:

```powershell
# Variables for request
$phone = "9602089889"          # Change this to your phone number
$isPolicyExpired = $false      # Set to $true if your policy is expired
$hasMadeClaim = $false         # Set to $true if you've made a claim
```

## Project Structure

- `src/services/scraperService.ts` - The main scraping logic
- `src/controllers/scrapeController.ts` - API controller
- `src/api/routes.ts` - API routes
- `get-quotes.ps1` - PowerShell client script
