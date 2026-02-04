# Deploy script for MeetReady Frontend
# Builds, pushes, and deploys to Google Cloud Run

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ID = "meetready-486312"
$REGION = "us-central1"
$REPO = "meet-ready"
$IMAGE = "meetready-frontend"
$FULL_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/${IMAGE}:latest"

# Build args
$BUILD_ARGS = @(
    "--build-arg", "NEXT_PUBLIC_SUPABASE_URL=https://zyxmwdajvzitsxxxhfow.supabase.co",
    "--build-arg", "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eG13ZGFqdnppdHN4eHhoZm93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjE3MzcsImV4cCI6MjA3NTUzNzczN30.vmWmCE5lob3WBorREsXlti_ezlyl1A1b1gY6gDRIzps",
    "--build-arg", "NEXT_PUBLIC_APP_URL=https://prepfor.app",
    "--build-arg", "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_1Sut9sL102TlIknQePiqKB0s",
    "--build-arg", "NEXT_PUBLIC_GA_MEASUREMENT_ID=G-RQN52025ZS"
)

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -ne "main") {
    Write-Host "WARNING: You are not on 'main' branch. You are on '$currentBranch'." -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to continue deploying '$currentBranch'? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Deployment cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== Building Docker image ===" -ForegroundColor Green
docker build @BUILD_ARGS -t $FULL_IMAGE .
if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }

Write-Host "`n=== Pushing to Artifact Registry ===" -ForegroundColor Green
docker push $FULL_IMAGE
if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }

Write-Host "`n=== Deploying to Cloud Run ===" -ForegroundColor Green
gcloud run deploy $IMAGE `
    --image $FULL_IMAGE `
    --region $REGION `
    --platform managed `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --max-instances 10 `
    --min-instances 0 `
    --timeout 60s

if ($LASTEXITCODE -ne 0) { throw "Cloud Run deploy failed" }

Write-Host "`n=== Deployment complete! ===" -ForegroundColor Green
Write-Host "Image: $FULL_IMAGE"
Write-Host "Service URL: https://meetready-frontend-xxxxxxxxxx-uc.a.run.app"
