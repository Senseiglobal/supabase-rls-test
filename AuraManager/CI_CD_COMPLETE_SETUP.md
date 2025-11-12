# Complete CI/CD Setup Guide for AuraManager

## 🚀 **Current Status**

✅ **Vercel Project Connected**
- Project ID: `prj_s9YN9Ws37u3DpIJ4TalzjY36e4pf`
- Custom Domain: `auramanager.app`
- Manual deployments working

✅ **GitHub Actions Workflows Created**
- Production deployment on main branch pushes
- Preview deployments for feature branches and PRs
- Automated build and deploy process

## 📋 **Setup Steps**

### **1. Connect GitHub Repository to Vercel**

Go to your Vercel dashboard: https://vercel.com/thomas-oguns-projects/supabase_test/settings/git

Configure:
- **Repository:** `Senseiglobal/supabase-rls-test`
- **Root Directory:** `AuraManager`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### **2. Configure GitHub Secrets**

In your GitHub repository (`Senseiglobal/supabase-rls-test`), go to:
**Settings → Secrets and variables → Actions**

Add these secrets:
```
VERCEL_TOKEN=[Get from https://vercel.com/account/tokens]
VERCEL_ORG_ID=team_UK4gHwB3quJa7oVlo767fhzB
VERCEL_PROJECT_ID=prj_s9YN9Ws37u3DpIJ4TalzjY36e4pf
```

### **3. Deployment Workflow**

**Production Deployments:**
- Trigger: Push to `main` branch
- Changes in: `AuraManager/` directory
- Deploy to: `auramanager.app`

**Preview Deployments:**
- Trigger: Push to feature branches or PRs
- Changes in: `AuraManager/` directory  
- Deploy to: Unique preview URLs

## 🔄 **Development Workflow**

### **Feature Development:**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes in AuraManager directory
# Edit files, add features, etc.

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Creates preview deployment automatically
# Get preview URL from GitHub Actions or Vercel dashboard
```

### **Production Release:**
```bash
# Merge to main (via PR or direct push)
git checkout main
git merge feature/new-feature
git push origin main

# Automatically deploys to auramanager.app
```

## 🎯 **Benefits of This Setup**

1. **Automatic Deployments:** No more manual `vercel --prod` commands
2. **Preview URLs:** Test features before merging to main
3. **Rollback Capability:** Easy rollback through Vercel dashboard
4. **Build History:** Complete deployment history and logs
5. **Parallel Development:** Multiple developers can work on features simultaneously

## 🔧 **Configuration Files Added**

- `.github/workflows/vercel-production.yml` - Production deployments
- `.github/workflows/vercel-preview.yml` - Preview deployments  
- `VERCEL_CICD_SETUP.md` - This setup guide

## 📊 **Monitoring Deployments**

- **Vercel Dashboard:** https://vercel.com/thomas-oguns-projects/supabase_test
- **GitHub Actions:** Check repository Actions tab
- **Build Logs:** Available in both Vercel and GitHub
- **Deployment Status:** Visible in GitHub PR checks

## 🚨 **Important Notes**

1. **Environment Variables:** Already configured in Vercel
2. **Custom Domain:** `auramanager.app` will always point to latest main deployment
3. **Build Directory:** Workflows target `AuraManager/` specifically
4. **Node Version:** Workflows use Node.js 18 (LTS)

## ✅ **Next Steps**

1. **Connect GitHub repo** in Vercel dashboard
2. **Add GitHub secrets** for automated deployments  
3. **Test the workflow** with a small commit
4. **Verify automatic deployment** to auramanager.app

Your CI/CD pipeline is now ready! Every push to main will automatically update auramanager.app 🎉