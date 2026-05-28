# Baby Chloe - Azure Deployment Guide

This guide covers deploying the Baby Chloe web application to Azure Static Web Apps.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed
- GitHub account (for CI/CD)
- Node.js 18+ installed locally

## Azure Resources Required

1. **Azure Static Web App** - Frontend hosting
2. **Azure App Service** or **Azure Functions** - Backend API
3. **Azure Cosmos DB** or **Azure SQL Database** - Data storage
4. **Azure Blob Storage** - File uploads (photos, audio)
5. **Azure Application Insights** - Monitoring

## Deployment Steps

### 1. Create Azure Static Web App

```bash
# Login to Azure
az login

# Create resource group
az group create --name rg-babychloe --location eastus

# Create Static Web App
az staticwebapp create \
  --name babychloe-web \
  --resource-group rg-babychloe \
  --source https://github.com/YOUR_USERNAME/babychloe \
  --location eastus \
  --branch main \
  --app-location "app/web" \
  --output-location "dist" \
  --login-with-github
```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token | From Azure Portal: Static Web App → Manage deployment token |
| `VITE_API_URL` | Backend API URL | Your Azure App Service URL (e.g., `https://babychloe-api.azurewebsites.net`) |
| `VITE_SIGNALR_HUB_URL` | SignalR hub URL | Same as API URL + `/hubs/sync` |

### 3. Environment Variables

Configure these in Azure Static Web App → Configuration:

```
VITE_API_URL=https://your-api.azurewebsites.net
VITE_SIGNALR_HUB_URL=https://your-api.azurewebsites.net/hubs/sync
VITE_ENABLE_CRY_ANALYZER=true
VITE_ENABLE_GROWTH_TRACKING=true
```

### 4. Custom Domain (Optional)

```bash
# Add custom domain
az staticwebapp hostname set \
  --name babychloe-web \
  --resource-group rg-babychloe \
  --hostname www.babychloe.com
```

### 5. Deploy Backend API

See the backend API README for deployment instructions. The backend should be deployed to:
- Azure App Service (recommended for production)
- Azure Functions (serverless option)
- Azure Container Apps (for containerized deployment)

## Manual Deployment

### Using Azure CLI

```bash
# Build the app
cd app/web
npm install
npm run build

# Deploy using Azure CLI
az staticwebapp deploy \
  --name babychloe-web \
  --resource-group rg-babychloe \
  --source ./dist
```

### Using VS Code Extension

1. Install "Azure Static Web Apps" extension
2. Sign in to Azure
3. Right-click `dist` folder → Deploy to Static Web App
4. Select your Static Web App resource

## CI/CD Pipeline

The included GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) automatically:

1. Triggers on push to `main` or PR to `main`
2. Installs dependencies
3. Builds the application
4. Deploys to Azure Static Web Apps
5. Creates preview environments for PRs

## Monitoring

### Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app babychloe-web-insights \
  --location eastus \
  --resource-group rg-babychloe \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app babychloe-web-insights \
  --resource-group rg-babychloe \
  --query instrumentationKey
```

Add to your environment variables:
```
VITE_APPINSIGHTS_INSTRUMENTATION_KEY=your-key-here
```

### Health Checks

The app includes basic health monitoring. Access at:
- Production: `https://babychloe-web.azurestaticapps.net`
- Preview: `https://babychloe-web-<pr-number>.azurestaticapps.net`

## Security

### Authentication

Configure Azure AD authentication:

1. Azure Portal → Static Web App → Authentication
2. Add Identity Provider → Azure Active Directory
3. Configure allowed users/groups
4. Update app configuration:

```
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_CLIENT_ID=your-client-id
```

### API Security

Ensure backend API has:
- CORS configured for Static Web App domain
- JWT authentication enabled
- Rate limiting configured
- HTTPS enforced

## Cost Estimation

### Free Tier (Development)
- Azure Static Web Apps: Free tier (100 GB bandwidth/month)
- Azure App Service: F1 Free tier
- Azure Cosmos DB: Free tier (400 RU/s)
- **Total: ~$0/month**

### Production (Standard)
- Azure Static Web Apps: Standard tier (~$9/month)
- Azure App Service: B1 Basic (~$13/month)
- Azure Cosmos DB: Serverless (~$25/month for moderate usage)
- Azure Blob Storage: ~$5/month
- Application Insights: ~$2/month
- **Total: ~$54/month**

### Production (Premium)
- Azure Static Web Apps: Standard tier (~$9/month)
- Azure App Service: P1V2 (~$73/month)
- Azure Cosmos DB: Provisioned (1000 RU/s ~$58/month)
- Azure Blob Storage: ~$10/month
- Application Insights: ~$5/month
- **Total: ~$155/month**

## Troubleshooting

### Build Failures

```bash
# Check build logs
az staticwebapp logs show \
  --name babychloe-web \
  --resource-group rg-babychloe
```

### API Connection Issues

1. Verify CORS settings in backend
2. Check API URL environment variable
3. Verify SSL certificate
4. Check Application Insights for errors

### Deployment Not Updating

1. Clear browser cache
2. Wait 5-10 minutes for CDN propagation
3. Check GitHub Actions for deployment status
4. Verify deployment token is valid

## Rollback

```bash
# List deployments
az staticwebapp environment list \
  --name babychloe-web \
  --resource-group rg-babychloe

# Rollback to previous deployment
az staticwebapp environment show \
  --name babychloe-web \
  --resource-group rg-babychloe \
  --environment-name default
```

## Local Development with Azure Services

```bash
# Use Azure Static Web Apps CLI for local dev with Azure functions
npm install -g @azure/static-web-apps-cli

# Start local development
swa start ./dist --api-location ../api
```

## Support Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Vite Documentation](https://vitejs.dev/)
- [Fluent UI Documentation](https://react.fluentui.dev/)

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain and SSL
3. Enable staging environments
4. Set up automated backups
5. Configure Azure Front Door for global distribution
