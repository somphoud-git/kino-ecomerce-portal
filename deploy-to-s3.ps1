# PowerShell script to deploy Next.js static site to S3
# Usage: .\deploy-to-s3.ps1

# Configuration
$BUCKET_NAME = "noracing-shop-s3-demo"
$REGION = "ap-southeast-2"
$BUILD_DIR = "out"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deploying to S3: $BUCKET_NAME" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if AWS CLI is installed
Write-Host "[1/5] Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "AWS CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "  Download: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check if build directory exists
Write-Host ""
Write-Host "[2/5] Checking build directory..." -ForegroundColor Yellow
if (!(Test-Path $BUILD_DIR)) {
    Write-Host "Build directory '$BUILD_DIR' not found!" -ForegroundColor Red
    Write-Host "  Please run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}
Write-Host "Build directory found" -ForegroundColor Green

# Step 3: Verify AWS credentials
Write-Host ""
Write-Host "[3/5] Verifying AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "AWS credentials verified" -ForegroundColor Green
    } else {
        throw "Credentials not configured"
    }
} catch {
    Write-Host "AWS credentials not configured!" -ForegroundColor Red
    Write-Host "  Please run 'aws configure' first" -ForegroundColor Yellow
    exit 1
}

# Step 4: Sync files to S3
Write-Host ""
Write-Host "[4/5] Uploading files to S3..." -ForegroundColor Yellow
Write-Host "  Bucket: s3://$BUCKET_NAME" -ForegroundColor Cyan
Write-Host "  Region: $REGION" -ForegroundColor Cyan
Write-Host ""

# Upload with proper cache control and content types
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME/ --region $REGION --delete --cache-control "public, max-age=31536000, immutable" --exclude "*.html" --exclude "sitemap.xml" --exclude "robots.txt"

# Upload HTML files with shorter cache
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME/ --region $REGION --content-type "text/html" --cache-control "public, max-age=0, must-revalidate" --exclude "*" --include "*.html"

# Upload sitemap and robots.txt if they exist
if (Test-Path "$BUILD_DIR\sitemap.xml") {
    aws s3 cp "$BUILD_DIR\sitemap.xml" s3://$BUCKET_NAME/sitemap.xml --region $REGION --content-type "application/xml" --cache-control "public, max-age=3600"
}

if (Test-Path "$BUILD_DIR\robots.txt") {
    aws s3 cp "$BUILD_DIR\robots.txt" s3://$BUCKET_NAME/robots.txt --region $REGION --content-type "text/plain" --cache-control "public, max-age=3600"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Files uploaded successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# Step 5: Configure website hosting
Write-Host ""
Write-Host "[5/5] Configuring S3 website hosting..." -ForegroundColor Yellow

aws s3 website s3://$BUCKET_NAME/ --index-document index.html --error-document 404.html --region $REGION

if ($LASTEXITCODE -eq 0) {
    Write-Host "Website hosting configured" -ForegroundColor Green
} else {
    Write-Host "Website hosting configuration may have failed" -ForegroundColor Yellow
}

# Display website URL
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Website URL:" -ForegroundColor Yellow
Write-Host "  http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com" -ForegroundColor Cyan
Write-Host ""
