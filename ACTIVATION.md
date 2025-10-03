# 🚀 Website Activation Guide

## Quick Start: Activate Your GitHub Pages Website

Your website repository is already set up with all the necessary code and configuration. You just need to **enable GitHub Pages** in your repository settings to make it live!

---

## ✨ Current Status

✅ **Repository is ready:** All code, content, and configuration files are in place  
✅ **GitHub Actions workflow configured:** Automatic deployment is set up  
⏳ **GitHub Pages needs activation:** Follow the steps below to go live

---

## 🎯 Activation Steps

### Step 1: Access Repository Settings

1. Go to your repository on GitHub:
   ```
   https://github.com/3mpowrApp/3mpwrapp.github.io/settings
   ```

2. Click on the **Settings** tab (⚙️ gear icon near the top)
   
   > **Note:** You need **admin permissions** to access repository settings

### Step 2: Navigate to Pages Settings

1. In the left sidebar, scroll down to **Code and automation** section
2. Click on **Pages**

### Step 3: Configure GitHub Pages

You'll see the GitHub Pages configuration page. Follow these settings:

#### **Build and deployment**

1. **Source:** Select **GitHub Actions**
   - This tells GitHub to use your workflow file (`.github/workflows/jekyll.yml`) to build and deploy the site
   
   > **Why GitHub Actions?** It's the modern deployment method that gives you:
   > - Automatic builds on every push to main
   > - Better control over the build process
   > - Faster deployments
   > - Build logs you can review

#### **Custom domain** (Optional)
- Leave blank to use the default: `https://3mpwrapp.github.io`
- Or enter a custom domain if you have one

### Step 4: Save and Wait

1. The settings save automatically when you select **GitHub Actions**
2. GitHub will now trigger the first deployment
3. Your website will be live at: **https://3mpwrapp.github.io**
4. First deployment takes 2-5 minutes

### Step 5: Verify Deployment

1. **Check the Actions tab:**
   ```
   https://github.com/3mpowrApp/3mpwrapp.github.io/actions
   ```
   - You should see a workflow run called "Deploy Jekyll site to Pages"
   - Wait for it to complete (green checkmark ✓)

2. **Visit your website:**
   ```
   https://3mpwrapp.github.io
   ```
   - You should see the 3mpowr App homepage
   - If you see a 404 error, wait a few more minutes and refresh

---

## 📋 Visual Step-by-Step Guide

### What You'll See in Settings → Pages

```
┌──────────────────────────────────────────────┐
│ Build and deployment                        │
├──────────────────────────────────────────────┤
│                                              │
│ Source                                       │
│ ┌──────────────────────────────────────────┐ │
│ │ GitHub Actions                ▼          │ │  ← SELECT THIS
│ └──────────────────────────────────────────┘ │
│                                              │
│ Your site is live at                         │
│ https://3mpwrapp.github.io                   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## ✅ Success Indicators

After activation, you should see:

1. ✅ **In Settings → Pages:**
   - "Your site is live at https://3mpwrapp.github.io"
   - A link to visit your site

2. ✅ **In Actions tab:**
   - A workflow run that completed successfully
   - Future pushes to `main` trigger automatic deployments

3. ✅ **When visiting the URL:**
   - The 3mpowr App homepage loads
   - Navigation works
   - No 404 errors

---

## 🔄 How Automatic Deployment Works

Once activated, your website updates automatically:

```
You push changes to main
         ↓
GitHub Actions triggers
         ↓
Jekyll builds the site
         ↓
Site deploys to GitHub Pages
         ↓
Website updates (2-5 minutes)
```

**Workflow file:** `.github/workflows/jekyll.yml`

---

## 🐛 Troubleshooting

### Issue: "Settings tab not visible"

**Cause:** You don't have admin permissions for the repository

**Solution:**
- Ask the repository owner to grant you admin access
- Or ask them to follow these activation steps

### Issue: "GitHub Actions option not showing"

**Cause:** Repository might be private or settings are limited

**Solution:**
1. Check that the repository is public
2. Go to Settings → Actions → General
3. Ensure "Allow all actions and reusable workflows" is enabled

### Issue: "Workflow run fails"

**Cause:** There might be an issue with the Jekyll build

**Solution:**
1. Click on the failed workflow run
2. Review the error logs
3. Common fixes:
   - Check `_config.yml` for syntax errors
   - Ensure all Markdown files have proper front matter
   - Verify image paths are correct

### Issue: "404 error when visiting site"

**Cause:** Deployment hasn't completed or Pages isn't configured

**Solution:**
1. Wait 5-10 minutes for first deployment
2. Verify GitHub Actions workflow completed
3. Check Settings → Pages shows "Your site is live"
4. Clear browser cache and try again

### Issue: "Site shows old content"

**Cause:** Browser cache or GitHub Pages cache

**Solution:**
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Wait a few minutes for cache to clear
3. Try in incognito/private browsing mode

---

## 🔒 Security Note

Your website is a **static site** - no backend server or database. This means:
- ✅ Secure by default
- ✅ No server to hack
- ✅ Fast loading times
- ✅ Free hosting through GitHub Pages

---

## 📚 Additional Resources

### Repository Documentation
- [README.md](README.md) - Project overview
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [.github/MAINTENANCE.md](.github/MAINTENANCE.md) - Maintenance guide
- [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md) - Branch protection setup

### GitHub Documentation
- [GitHub Pages Quick Start](https://docs.github.com/en/pages/quickstart)
- [GitHub Pages with Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
- [Jekyll Documentation](https://jekyllrb.com/docs/)

### Need Help?
- 📧 Email: empowrapp08162025@gmail.com
- 🐛 [Open an Issue](https://github.com/3mpowrApp/3mpwrapp.github.io/issues)
- 💬 Check existing documentation in `.github/` directory

---

## 🎉 What's Next?

After activating your website:

1. **Set up branch protection** - See [BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)
2. **Customize content** - Edit Markdown files to update website content
3. **Add contributors** - Invite team members to collaborate
4. **Monitor deployments** - Watch the Actions tab for build status
5. **Share your site** - Start promoting your live website!

---

**Ready to activate? Follow Step 1 above and you'll be live in minutes!** 🚀

---

© 2025 3mpowr App. All rights reserved.
