# =================================================================
#  Hugo Deployment Script for GitHub Pages
#  Author: QwQBiG & hisai
#  Version: 2.0 (All-English)
# =================================================================

# This script automates the entire process of building and deploying your Hugo site.
# It requires one argument: a commit message for this deployment.

param(
    [string]$commitMessage
)

# --- Step 1: Validate Input ---
if (-not $commitMessage) {
    Write-Host "ERROR: A commit message is required." -ForegroundColor Red
    Write-Host "USAGE: .\deploy.ps1 \"Your meaningful commit message\""
    exit 1
}

Write-Host "INFO: Starting deployment process..." -ForegroundColor Cyan

# --- Step 2: Clean previous build ---
Write-Host "INFO: Cleaning up the old 'public' directory..."
if (Test-Path -Path public) {
    Remove-Item -Recurse -Force public
}

# --- Step 3: Build the site with Hugo ---
Write-Host "INFO: Building the website with Hugo..."
hugo

# --- Step 4: Verify the build was successful ---
if (-not (Test-Path -Path public)) {
    Write-Host "ERROR: Hugo build failed. The 'public' directory was not created." -ForegroundColor Red
    exit 1
}
Write-Host "INFO: Hugo build successful." -ForegroundColor Green

# --- Step 5: Navigate into the public directory ---
cd public

# --- Step 6: Deploy to GitHub ---
Write-Host "INFO: Preparing to push to GitHub..."
git init
git remote add origin https://github.com/QwQBiG/QwQBiG.github.io.git
git add .
git commit -m "$commitMessage"
git branch -M main

Write-Host "INFO: Pushing files to the 'main' branch..."
git push --force -u origin main

# --- Step 7: Finalize ---
cd ..
Write-Host "-----------------------------------------------------"
Write-Host "SUCCESS: Deployment complete!" -ForegroundColor Green
Write-Host "Your website has been successfully pushed to GitHub."
Write-Host "Please wait 1-2 minutes for GitHub Pages to update."
Write-Host "Then, remember to hard-refresh your browser (Ctrl+Shift+R)."
Write-Host "-----------------------------------------------------"