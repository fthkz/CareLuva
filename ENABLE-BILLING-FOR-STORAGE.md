# Enable Billing for Firebase Storage (Free Tier)

## Why Billing is Required

Firebase Storage requires billing to be enabled, even if you stay within the free tier limits. This is a Google Cloud requirement.

**Good News**: You can use the free tier without charges:
- **5 GB** storage free
- **1 GB/day** downloads free
- **20,000 operations/day** free

## Steps to Enable Billing

### Step 1: Go to Billing Setup
1. Go to: https://console.cloud.google.com/billing?project=careluva-5635e
2. Or: [Firebase Console → Usage and Billing](https://console.firebase.google.com/project/careluva-5635e/usage)

### Step 2: Start Free Trial or Link Billing Account
You have two options:

#### Option A: Start Free Trial (Recommended for Testing)
1. Click **"Start Free Trial"** or **"Link a billing account"**
2. You'll be redirected to Google Cloud Billing
3. If you don't have a billing account:
   - Click **"Create Billing Account"**
   - Fill in your information
   - Add a payment method (credit card)
   - **Note**: You won't be charged unless you exceed free tier limits
4. Complete the setup

#### Option B: Use Existing Billing Account
1. If you already have a Google Cloud billing account
2. Select it from the list
3. Link it to the project

### Step 3: Set Up Billing Alerts (Recommended)
To avoid unexpected charges:

1. Go to: https://console.cloud.google.com/billing?project=careluva-5635e
2. Click on your billing account
3. Go to **"Budgets & alerts"**
4. Create a budget:
   - **Amount**: $1.00 (or your preferred limit)
   - **Alert threshold**: 50%, 90%, 100%
   - This will email you if you approach the limit

### Step 4: Create Storage Bucket
After billing is enabled:

1. Go to: https://console.firebase.google.com/project/careluva-5635e/storage
2. Click **"Get Started"** or **"Create bucket"**
3. Configure:
   - **Location**: Choose a region (e.g., `us-central1`)
   - **Security rules**: Start in production mode (uses your custom rules)
4. Click **"Done"**

### Step 5: Deploy Storage Rules
Once the bucket is created:

```bash
firebase deploy --only storage
```

## Free Tier Limits

You can use these amounts **free every month**:
- **Storage**: 5 GB
- **Downloads**: 1 GB/day
- **Operations**: 20,000/day

For a small clinic photo gallery, you'll likely stay well within these limits.

## Cost Estimate

**Example**: 100 photos, 2 MB each = 200 MB
- Well within 5 GB free tier ✅
- Downloads: Even with 100 views/day = 200 MB/day (within 1 GB limit) ✅

## Important Notes

1. **No charges for free tier**: You only pay if you exceed the free limits
2. **Billing alerts**: Set up alerts to monitor usage
3. **Free tier resets monthly**: Limits reset each month
4. **You can disable billing later**: If you stop using Storage, you can unlink billing

## After Billing is Enabled

1. Create the Storage bucket (Step 4 above)
2. Deploy storage rules: `firebase deploy --only storage`
3. Test uploads at: `http://localhost:8080/clinic-photo-gallery.html`

## Troubleshooting

If you still see errors after enabling billing:
1. Wait 2-3 minutes for billing to activate
2. Refresh the Firebase Console page
3. Try creating the bucket again
4. Check that billing account is linked to the project

