# Set Up Billing Alerts for $300 Free Credit

## Why Set Up Alerts

The $300 free credit is valid for 90 days. Setting up alerts helps you:
- Monitor credit usage
- Get notified before credits run out
- Avoid unexpected charges
- Track spending across services

## Step-by-Step: Create Budget Alert

### Step 1: Go to Budgets & Alerts
1. Go to: https://console.cloud.google.com/billing?project=careluva-5635e
2. Click on your **billing account** (the one you just created)
3. In the left sidebar, click **"Budgets & alerts"**
4. Click **"CREATE BUDGET"** button

### Step 2: Configure Budget
1. **Budget name**: Enter a name like "CareLuva Development Budget" or "Free Credit Monitor"
2. **Budget scope**: 
   - Select **"Billing account"** (to track all projects)
   - Or **"Project"** → Select `careluva-5635e` (to track only this project)
3. **Budget amount**:
   - **Set budget**: $300 (or less if you want to be more conservative)
   - **Period**: Monthly (or match your billing cycle)
4. Click **"NEXT"**

### Step 3: Set Alert Thresholds
Configure when you want to be notified:

1. **Alert 1**: 
   - **Percent of budget**: 50%
   - **Email recipients**: Add your email address
   - This alerts you when you've used $150 (50% of $300)

2. **Alert 2**:
   - **Percent of budget**: 90%
   - **Email recipients**: Add your email address
   - This alerts you when you've used $270 (90% of $300)

3. **Alert 3**:
   - **Percent of budget**: 100%
   - **Email recipients**: Add your email address
   - This alerts you when you've used all $300

4. **Optional - Alert 4**:
   - **Percent of budget**: 110% (if you want to know if you exceed)
   - **Email recipients**: Add your email address

5. Click **"NEXT"**

### Step 4: Review and Create
1. Review your budget settings
2. Click **"CREATE BUDGET"**

## Alternative: Quick Alert Setup

If you want a simpler setup:

1. Go to: https://console.cloud.google.com/billing?project=careluva-5635e
2. Click on your billing account
3. Go to **"Budgets & alerts"**
4. Click **"CREATE BUDGET"**
5. Use these quick settings:
   - **Name**: "Free Credit Monitor"
   - **Amount**: $300
   - **Alerts**: 50%, 90%, 100%
   - **Email**: Your email
6. Click **"CREATE BUDGET"**

## Monitor Credit Usage

### View Current Usage
1. Go to: https://console.cloud.google.com/billing?project=careluva-5635e
2. Click on your billing account
3. View **"Cost breakdown"** to see:
   - Total credits used
   - Credits remaining
   - Services using credits
   - Daily/weekly/monthly trends

### View Detailed Reports
1. Go to: https://console.cloud.google.com/billing?project=careluva-5635e
2. Click **"Reports"** in the left sidebar
3. See detailed breakdown by:
   - Service (Storage, Firestore, etc.)
   - Project
   - Time period

## Recommended Alert Settings

For $300 free credit over 90 days:

| Alert | Threshold | Amount | Purpose |
|-------|-----------|--------|---------|
| Warning | 50% | $150 | Early warning |
| Critical | 90% | $270 | Time to review |
| Exceeded | 100% | $300 | Credit exhausted |

## Additional Monitoring Tips

### 1. Set Up Daily Email Digest (Optional)
1. Go to billing account settings
2. Enable **"Daily cost email"**
3. Get daily summaries of spending

### 2. Check Credit Expiry
1. Go to billing account
2. View **"Credits"** section
3. See when your $300 credit expires (90 days from signup)

### 3. Monitor Specific Services
If you want to track specific services (like Storage):

1. Create a separate budget for specific services
2. In budget configuration, add **"Filter"**
3. Select service: **"Cloud Storage"**
4. Set alerts for that service only

## What Happens After $300 Credit Runs Out?

1. **You'll get alerts** at 50%, 90%, and 100%
2. **At 100%**: You'll be notified that credit is exhausted
3. **Charges**: You'll only be charged if:
   - You explicitly enable pay-as-you-go billing, OR
   - You have automatic charges enabled
4. **Services may stop**: Some services might pause until you enable billing

## Free Tier After Credit Expires

Even after $300 credit expires, you still get:
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day (free)
- **Storage**: 5 GB storage, 1 GB/day downloads (free)
- **Hosting**: 10 GB storage, 360 MB/day transfer (free)

So you can continue using the app within free tier limits.

## Quick Links

- **Budgets & Alerts**: https://console.cloud.google.com/billing/budgets?project=careluva-5635e
- **Billing Account**: https://console.cloud.google.com/billing?project=careluva-5635e
- **Cost Breakdown**: https://console.cloud.google.com/billing?project=careluva-5635e (click billing account → Cost breakdown)
- **Reports**: https://console.cloud.google.com/billing/reports?project=careluva-5635e

## Troubleshooting

**Can't create budget?**
- Make sure you're the billing account owner/admin
- Wait a few minutes after creating billing account
- Try refreshing the page

**Not receiving emails?**
- Check spam folder
- Verify email address in alert settings
- Check Google Cloud notification settings

**Want to change alert thresholds?**
- Go to Budgets & alerts
- Click on your budget
- Click "Edit"
- Update thresholds
- Save changes

