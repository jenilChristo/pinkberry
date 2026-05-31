# GitHub Secrets Setup for Baby Chloe Web Deployment

## 🔐 Required GitHub Secrets

To enable automatic deployment to Azure Static Web Apps, configure these secrets in your GitHub repository:

### Step 1: Navigate to GitHub Repository Settings

1. Go to: https://github.com/jenilChristo/pinkberry
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add Required Secrets

#### Secret 1: AZURE_STATIC_WEB_APPS_API_TOKEN
- **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **Value:** 
```
11e23d9ef594c6c8ed4c4181a8a532bcbb39f6107aabc194f8d3656ac4e5942f07-81f44f01-2ad5-451e-a368-1a8be34b66a900f312906880c90f
```
- **Description:** Azure Static Web Apps deployment token for automatic deployments

#### Secret 2: VITE_API_URL
- **Name:** `VITE_API_URL`
- **Value:** 
```
https://babychloe-cucjg6fuhtb3faa0.southindia-01.azurewebsites.net
```
- **Description:** Backend API URL for the Baby Chloe web application

#### Secret 3: VITE_SIGNALR_HUB_URL
- **Name:** `VITE_SIGNALR_HUB_URL`
- **Value:** 
```
https://babychloe-cucjg6fuhtb3faa0.southindia-01.azurewebsites.net/hubs/sync
```
- **Description:** SignalR hub URL for real-time synchronization

### Step 3: Verify Secrets

After adding all three secrets, you should see them listed:
- ✅ AZURE_STATIC_WEB_APPS_API_TOKEN
- ✅ VITE_API_URL
- ✅ VITE_SIGNALR_HUB_URL

### Step 4: Trigger Deployment

Once secrets are configured, trigger deployment by:

**Option A: Push a change to the web app**
```bash
cd "D:\cool apps\babychloe\app"
git commit --allow-empty -m "trigger: Deploy to Azure Static Web Apps"
git push origin master
```

**Option B: Manual workflow trigger**
1. Go to: https://github.com/jenilChristo/pinkberry/actions
2. Select **Deploy Baby Chloe Web App** workflow
3. Click **Run workflow** → **Run workflow**

### Step 5: Monitor Deployment

1. Go to: https://github.com/jenilChristo/pinkberry/actions
2. Watch the deployment progress
3. When complete, visit your deployed app at:
   - **URL:** https://zealous-flower-06880c90f.7.azurestaticapps.net

---

## 🌐 Deployed Application Info

### Azure Resources Created
- **Resource Group:** rg-babychloe
- **Static Web App:** babychloe-web
- **Location:** East US 2
- **SKU:** Free
- **Default URL:** https://zealous-flower-06880c90f.7.azurestaticapps.net

### Backend API
- **URL:** https://babychloe-cucjg6fuhtb3faa0.southindia-01.azurewebsites.net
- **Location:** South India
- **SignalR Hub:** /hubs/sync

---

## 🔧 Local Development

For local development with Azure backend:

1. Navigate to web app directory:
```bash
cd "D:\cool apps\babychloe\app\web"
```

2. Create `.env` file:
```env
VITE_API_URL=https://babychloe-cucjg6fuhtb3faa0.southindia-01.azurewebsites.net
VITE_SIGNALR_HUB_URL=https://babychloe-cucjg6fuhtb3faa0.southindia-01.azurewebsites.net/hubs/sync
VITE_ENABLE_CRY_ANALYZER=true
VITE_ENABLE_GROWTH_TRACKING=true
```

3. Install and run:
```bash
npm install
npm run dev
```

4. Open: http://localhost:5173

---

## ✅ Checklist

- [ ] Add AZURE_STATIC_WEB_APPS_API_TOKEN secret
- [ ] Add VITE_API_URL secret
- [ ] Add VITE_SIGNALR_HUB_URL secret
- [ ] Trigger deployment (push or manual)
- [ ] Verify deployment in GitHub Actions
- [ ] Test deployed application
- [ ] Verify API connectivity
- [ ] Test all features (Login, Dashboard, Tracking, Cry Analyzer)

---

## 🆘 Troubleshooting

### Deployment fails with "401 Unauthorized"
- Verify AZURE_STATIC_WEB_APPS_API_TOKEN is correct
- Regenerate token: `az staticwebapp secrets list --name babychloe-web --resource-group rg-babychloe`

### API calls fail with CORS errors
- Ensure backend API has CORS configured for: `https://zealous-flower-06880c90f.7.azurestaticapps.net`
- Check backend API is running and accessible

### Build fails
- Check package.json dependencies
- Verify Node.js version (18+)
- Check build logs in GitHub Actions

---

## 📝 Next Steps

1. **Configure Backend CORS** - Add Static Web App URL to allowed origins
2. **Test Authentication** - Verify login/register works with backend
3. **Test Features** - Try all tracking features (Sleep, Feeding, Diaper, Growth)
4. **Test Cry Analyzer** - Verify Web Audio API and analysis work
5. **Custom Domain** (Optional) - Configure custom domain in Azure Portal
6. **SSL Certificate** - Automatic with Azure Static Web Apps
7. **Monitor Usage** - Set up Application Insights alerts

