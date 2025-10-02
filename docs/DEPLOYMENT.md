# CPAnalyzer v2 Deployment Guide

This document outlines the process for deploying the CPAnalyzer v2 application using Netlify and GitHub, including staging environment setup for safe migrations.

## Overview

The application uses a **dual-environment deployment strategy** with continuous deployment:
- **Production**: Deploys from `main` branch
- **Staging**: Deploys from `develop` branch for testing migrations and features

- **Hosting Provider**: [Netlify](https://www.netlify.com/)
- **Git Provider**: [GitHub](https://github.com/)
- **Production URL**: [https://cpanalyzerdemo.netlify.app](https://cpanalyzerdemo.netlify.app)
- **Staging URL**: [https://cpanalyzer-staging.netlify.app](https://cpanalyzer-staging.netlify.app)

---

## 🏗️ **Deployment Architecture**

### **Branch Strategy**
```
main (production)     ← Only stable, tested code
  ↑
develop (staging)     ← Integration branch for testing
  ↑
feature/xyz           ← Feature branches for new development
```

### **Environment Configuration**
```
Production Environment:
- Site: cpanalyzerdemo.netlify.app
- Branch: main
- Current: df3fff6 (feat: add bootes and basic victory datasets)

Staging Environment:
- Site: cpanalyzer-staging.netlify.app  
- Branch: develop
- Purpose: Testing new features before production
```

---

## One-Time Setup

The following dual-environment setup has been configured:

### **Production Site** (`cpanalyzerdemo`)
1.  **GitHub Repository**: Private repository `danleads/cpanalyzer-demo`
2.  **Netlify Configuration**:
    - **Production branch**: `main`
    - **Build command**: `next build`
    - **Publish directory**: `.next`
    - **Deploy context**: Deploy only the production branch
    - **Deploy previews**: Any pull request against main

### **Staging Site** (`cpanalyzer-staging`)
1.  **Same GitHub Repository**: Uses the same `danleads/cpanalyzer-demo` repo
2.  **Netlify Configuration**:
    - **Production branch**: `develop`
    - **Build command**: `next build`
    - **Publish directory**: `.next`
    - **Deploy context**: Deploy only the develop branch
    - **Deploy previews**: Any pull request against develop

---

## 🛡️ **Safe Deployment Workflow**

The dual-environment setup ensures safe deployments with staging validation:

### **Development Flow**
1.  **Feature Development**: Create feature branches from `develop`
    ```bash
    git checkout develop
    git checkout -b feature/new-feature
    # Make your changes
    git add .
    git commit -m "feat: Add new feature"
    git push -u origin feature/new-feature
    ```

2.  **Staging Deployment**: Merge to `develop` for staging testing
    ```bash
    git checkout develop
    git merge feature/new-feature
    git push origin develop
    ```
    
    This automatically deploys to: **https://cpanalyzer-staging.netlify.app**

3.  **Production Deployment**: After staging validation, merge to `main`
    ```bash
    git checkout main
    git merge develop
    git push origin main
    ```
    
    This automatically deploys to: **https://cpanalyzerdemo.netlify.app**

### **Emergency Hotfixes**
For critical production fixes:
```bash
git checkout main
git checkout -b hotfix/critical-fix
# Make minimal changes
git checkout main
git merge hotfix/critical-fix
git push origin main

# Also update develop
git checkout develop
git merge main
git push origin develop
```

---

## 🎯 **Best Practices**

### **1. Always Test in Staging First**
- ✅ Never deploy directly to production
- ✅ Validate all features in staging environment
- ✅ Test with realistic data and scenarios

### **2. Keep Environments in Sync**
- ✅ Staging should mirror production as closely as possible
- ✅ Regularly sync `develop` with `main` if needed
- ✅ Use same Node.js/Next.js versions

### **3. Monitor Deployments**
- ✅ Watch Netlify build logs for both environments
- ✅ Test immediately after deployment
- ✅ Have rollback plan ready

---

## 📋 **Current Status**

### **Branch Alignment**
- **`main`**: df3fff6 (feat: add bootes and basic victory datasets)
- **`develop`**: df3fff6 (synchronized with main)
- **Ready for**: New feature development on staging

### **Environment URLs**
- **Production**: [https://cpanalyzerdemo.netlify.app](https://cpanalyzerdemo.netlify.app)
- **Staging**: [https://cpanalyzer-staging.netlify.app](https://cpanalyzer-staging.netlify.app) 