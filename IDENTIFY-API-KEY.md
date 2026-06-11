# Identify Which API Key to Update

## Your API Keys
1. **CareLuva Web (auto created by Firebase)**
2. **API key 1**

## Which One to Update?

Your `firebase-config.js` uses:
```javascript
apiKey: "AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A"
```

## Steps to Identify

### Step 1: Check Both API Keys
1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click on **"CareLuva Web (auto created by Firebase)"**
3. Look at the **API key** value (it will show the full key)
4. Compare it with: `AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A`
5. If it matches → This is the one to update
6. If it doesn't match → Click on **"API key 1"** and check that one

### Step 2: Update the Correct Key
Once you've identified which key matches `AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A`:

1. Click on that API key to edit
2. Under **Application restrictions**:
   - If set to **"HTTP referrers (web sites)"**:
     - Add these referrers:
       ```
       http://localhost:8000/*
       http://127.0.0.1:8000/*
       http://localhost:8080/*
       http://127.0.0.1:8080/*
       ```
   - If set to **"None"**:
     - Change to **"HTTP referrers (web sites)"**
     - Add the referrers above
3. Click **Save**

## Most Likely: "CareLuva Web"
Since it says "auto created by Firebase", this is most likely the one used by your Firebase Web app. But **always verify** by checking the actual API key value matches `AIzaSyAbSxm6yDqa25lxOuynlZV7icrcb_Os27A`.

## After Updating
1. Wait 1-2 minutes
2. Clear browser cache or use incognito
3. Try logging in again

