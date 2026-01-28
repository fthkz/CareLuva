# CodeRabbit Installation Guide

## 🎯 Which Option to Choose?

### For Open Source Projects (Your Case):
**Choose: "Open Source" or "Free for Open Source"**

CodeRabbit offers free reviews for open source repositories. Since CareLuva appears to be an open source project, you should use the free option.

---

## 📝 Step-by-Step Installation

### Step 1: Go to CodeRabbit Marketplace
1. Visit: https://github.com/marketplace/coderabbitai
2. You'll see options:
   - **"Set up free trial"** - For private repositories (paid)
   - **"Open Source"** or **"Free for Open Source"** - For public repositories (free)

### Step 2: Choose Open Source Option
1. Click on **"Open Source"** or **"Free for Open Source"** button
2. This will take you to the installation page

### Step 3: Configure Installation
1. **Select Account**: Choose your GitHub account (fthkz)
2. **Select Repositories**:
   - Option A: **"Only select repositories"** (Recommended)
     - Then select: `CareLuva`
   - Option B: **"All repositories"** (if you want it for all repos)
3. **Review Permissions**: CodeRabbit needs:
   - ✅ Read access to code
   - ✅ Read access to pull requests
   - ✅ Write access to comments (to post reviews)

### Step 4: Install
1. Click **"Install"** or **"Save"**
2. You may be asked to authorize CodeRabbit
3. Click **"Authorize"** if prompted

### Step 5: Verify Installation
1. Go to: https://github.com/fthkz/CareLuva/settings/installations
2. You should see **"CodeRabbit"** or **"CodeRabbitAI"** in the list
3. Status should show as **"Active"**

---

## ⚠️ Important Notes

### Free Trial vs Open Source:
- **Free Trial**: 
  - For private repositories
  - Limited time (usually 14 days)
  - Then requires payment
  - ❌ Don't choose this for open source

- **Open Source**:
  - For public repositories
  - Free forever
  - Full features
  - ✅ Choose this option

### If Your Repository is Private:
If CareLuva is a private repository, you have two options:
1. **Make it public** (if possible) → Use free open source option
2. **Keep it private** → Use free trial (limited time) or paid plan

---

## 🔍 How to Check if Repository is Public/Private

1. Go to: https://github.com/fthkz/CareLuva
2. Look at the repository settings icon (gear) or check URL
3. If you see a lock icon 🔒 = Private
4. If you see an unlock icon 🔓 = Public

---

## ✅ After Installation

### What Happens Next:
1. **Immediate**: CodeRabbit is installed
2. **Within 1-2 minutes**: CodeRabbit will review your existing PR
3. **Future PRs**: CodeRabbit will automatically review all new PRs

### Verify It's Working:
1. Go to your PR: https://github.com/fthkz/CareLuva/pulls
2. Click on your test PR
3. Wait 2-5 minutes
4. Look for comments from `coderabbit[bot]`

---

## 🆘 Troubleshooting

### If "Open Source" Option Doesn't Appear:
1. Make sure your repository is public
2. Check CodeRabbit's current offerings
3. You can still use the free trial for testing

### If Installation Fails:
1. Check your GitHub permissions
2. Make sure you're the repository owner/admin
3. Try refreshing the page

### If CodeRabbit Doesn't Review:
1. Wait 5-10 minutes (it needs time to analyze)
2. Check PR is not in "Draft" mode
3. Optional: check for `.coderabbit.yml`/`.coderabbit.yaml` only if you want custom configuration (CodeRabbit works immediately after installation without it)
4. Check installation status in Settings → Integrations

---

## 📊 Quick Decision Guide

```
Is your repository PUBLIC?
├─ YES → Choose "Open Source" / "Free for Open Source" ✅
└─ NO → Choose "Set up free trial" (limited time) or make repo public
```

---

## 🎯 Recommended Action

**For CareLuva (assuming it's open source):**
1. ✅ Choose **"Open Source"** option
2. ✅ Select **"Only select repositories"**
3. ✅ Choose **"CareLuva"** repository
4. ✅ Click **"Install"**
5. ✅ Wait 2-5 minutes
6. ✅ Check your PR for CodeRabbit comments

---

**Status**: Ready to install CodeRabbit! 🚀

