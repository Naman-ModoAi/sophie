# SophiHQ Frontend - Cloud Run Deployment Guide

This guide covers deploying the Next.js frontend to Google Cloud Run.

---

## Prerequisites

### 1. Google Cloud Setup

```bash
# Install Google Cloud SDK (if not already installed)
# https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Environment Variables

Create a `.env.production` file with your production environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google OAuth (configured in Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Gemini AI
GOOGLE_GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-3-flash-preview

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...

# App URL (will be your Cloud Run URL)
NEXT_PUBLIC_APP_URL=https://your-service-name-xxxxxx-uc.a.run.app
```

---

## Deployment Methods

### Method 1: Manual Deployment (Recommended for First Deploy)

#### Step 1: Build and Test Locally

```bash
# Build the Docker image
docker build -t meetready-frontend .

# Test locally
docker run -p 8080:8080 \
  --env-file .env.production \
  meetready-frontend

# Visit http://localhost:8080 to verify
```

#### Step 2: Deploy to Cloud Run

```bash
# Set variables
export PROJECT_ID=your-project-id
export REGION=us-central1
export SERVICE_NAME=meetready-frontend

# Build and submit to Google Container Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 60s
```

#### Step 3: Set Environment Variables

```bash
# Set environment variables in Cloud Run
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ..." \
  --set-env-vars "SUPABASE_SERVICE_ROLE_KEY=eyJ..." \
  --set-env-vars "NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=your_client_secret" \
  --set-env-vars "GOOGLE_GEMINI_API_KEY=your_api_key" \
  --set-env-vars "GEMINI_MODEL=gemini-3-flash-preview" \
  --set-env-vars "STRIPE_SECRET_KEY=sk_live_..." \
  --set-env-vars "STRIPE_WEBHOOK_SECRET=whsec_..." \
  --set-env-vars "NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_..." \
  --set-env-vars "NEXT_PUBLIC_APP_URL=https://your-service-url.run.app"
```

**Tip**: Use `--update-env-vars` to update specific variables without affecting others.

#### Step 4: Verify Deployment

```bash
# Get the service URL
gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format 'value(status.url)'

# Check service status
gcloud run services describe $SERVICE_NAME --region $REGION
```

---

### Method 2: Automated Deployment with Cloud Build

This method uses `cloudbuild.yaml` for CI/CD.

#### Step 1: Set up Cloud Build Trigger

```bash
# Connect your repository (GitHub/GitLab/Bitbucket)
gcloud beta builds triggers create github \
  --repo-name=your-repo-name \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# OR manually trigger a build
gcloud builds submit --config cloudbuild.yaml
```

#### Step 2: Set Environment Variables via Secret Manager (Recommended)

```bash
# Create secrets in Secret Manager
echo -n "your-secret-value" | gcloud secrets create supabase-url --data-file=-
echo -n "your-anon-key" | gcloud secrets create supabase-anon-key --data-file=-
# ... create secrets for all env vars

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding supabase-url \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secrets
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --set-secrets "NEXT_PUBLIC_SUPABASE_URL=supabase-url:latest" \
  --set-secrets "NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key:latest"
  # ... add all other secrets
```

---

## Post-Deployment Configuration

### 1. Custom Domain Setup

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service $SERVICE_NAME \
  --domain meetready.app \
  --region $REGION

# Follow DNS instructions to add records
```

### 2. Update OAuth Redirect URLs

Update your Supabase OAuth settings with the new Cloud Run URL:
- Supabase Dashboard → Authentication → URL Configuration
- Add Cloud Run URL to "Redirect URLs"
- Update "Site URL" to Cloud Run URL

### 3. Update Stripe Webhook URL

Update your Stripe webhook endpoint:
- Stripe Dashboard → Developers → Webhooks
- Update endpoint URL to: `https://your-service-url.run.app/api/stripe/webhook`

### 4. Enable Cloud Run Logging

```bash
# View logs
gcloud run services logs read $SERVICE_NAME \
  --region $REGION \
  --limit 50

# Stream logs
gcloud run services logs tail $SERVICE_NAME --region $REGION
```

---

## Optimization & Scaling

### Resource Configuration

Adjust based on your traffic:

```bash
# For high traffic
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 50 \
  --min-instances 1

# For cost optimization
gcloud run services update $SERVICE_NAME \
  --region $REGION \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

### Enable Cloud CDN (for static assets)

```bash
# Create backend bucket
gcloud compute backend-buckets create meetready-cdn \
  --gcs-bucket-name=your-bucket-name

# Create load balancer with Cloud CDN
# (Follow GCP Load Balancer setup guide)
```

---

## Monitoring & Alerts

### Set up Cloud Monitoring

```bash
# Create uptime check
gcloud monitoring uptime-checks create https://your-service-url.run.app \
  --display-name="SophiHQ Frontend Uptime"

# Create alert policy
# (Use Google Cloud Console for detailed configuration)
```

### Useful Metrics to Monitor

- Request count
- Request latency (p50, p95, p99)
- Error rate (5xx errors)
- Instance count
- CPU utilization
- Memory utilization

---

## Rollback

If deployment fails, rollback to previous version:

```bash
# List revisions
gcloud run revisions list \
  --service $SERVICE_NAME \
  --region $REGION

# Rollback to specific revision
gcloud run services update-traffic $SERVICE_NAME \
  --region $REGION \
  --to-revisions REVISION_NAME=100
```

---

## Troubleshooting

### Build Failures

```bash
# View build logs
gcloud builds list --limit 5
gcloud builds log BUILD_ID
```

### Runtime Errors

```bash
# Check service logs
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100

# Describe service to check configuration
gcloud run services describe $SERVICE_NAME --region $REGION
```

### Common Issues

1. **Port 8080 not exposed**: Ensure Dockerfile exposes port 8080
2. **Environment variables missing**: Verify all env vars are set in Cloud Run
3. **OAuth redirect fails**: Update Supabase redirect URLs with Cloud Run URL
4. **Build timeout**: Increase timeout in cloudbuild.yaml
5. **Memory issues**: Increase memory allocation in Cloud Run

---

## Cost Optimization Tips

1. **Set min-instances to 0** for low-traffic apps (cold start tradeoff)
2. **Use appropriate memory/CPU** (start with 512Mi/1 CPU)
3. **Enable request-based pricing** (default for Cloud Run)
4. **Set max-instances** to prevent runaway costs
5. **Use Cloud CDN** for static assets
6. **Monitor usage** with Cloud Billing reports

---

## Security Best Practices

1. **Use Secret Manager** for sensitive environment variables
2. **Enable VPC connector** if accessing private resources
3. **Set up IAM policies** with least privilege
4. **Enable Cloud Armor** for DDoS protection
5. **Use HTTPS** (Cloud Run provides SSL by default)
6. **Regular security updates** - rebuild images regularly

---

## CI/CD Pipeline (Recommended Setup)

```
GitHub Push (main branch)
    ↓
Cloud Build Trigger
    ↓
Build Docker Image
    ↓
Push to Container Registry
    ↓
Deploy to Cloud Run
    ↓
Run Health Checks
    ↓
Send Notification (Success/Failure)
```

---

## Quick Reference Commands

```bash
# Deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
gcloud run deploy $SERVICE_NAME --image gcr.io/$PROJECT_ID/$SERVICE_NAME --region $REGION

# Update env vars
gcloud run services update $SERVICE_NAME --update-env-vars KEY=VALUE --region $REGION

# View logs
gcloud run services logs tail $SERVICE_NAME --region $REGION

# Get service URL
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'

# Delete service
gcloud run services delete $SERVICE_NAME --region $REGION
```

---

## Support

For issues specific to:
- **Cloud Run**: https://cloud.google.com/run/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **SophiHQ App**: Check CLAUDE.md and internal documentation

---

**Last Updated**: 2026-02-04
