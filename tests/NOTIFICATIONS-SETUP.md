# 🔔 Test Notifications Setup

## Overview

GitHub Actions workflow has been configured to send notifications on test results. Currently, Slack notifications are set up (optional).

## Current Configuration

### GitHub Actions Notifications

The workflow (`.github/workflows/tests.yml`) includes notification steps that:
- Send notification on test failure
- Send notification on test success
- Use Slack webhook (optional)

## Setup Options

### Option 1: Slack Notifications (Recommended)

1. **Create Slack Webhook**:
   - Go to https://api.slack.com/apps
   - Create a new app or use existing
   - Go to "Incoming Webhooks"
   - Activate webhooks
   - Create webhook for your channel
   - Copy webhook URL

2. **Add to GitHub Secrets**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Your Slack webhook URL
   - Click "Add secret"

3. **Notifications will work automatically**:
   - On test failure: Slack message with failure details
   - On test success: Slack message with success confirmation

### Option 2: Email Notifications

To add email notifications, you can use the `send-email` action:

```yaml
- name: Send email on failure
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: 'Tests Failed - CareLuva'
    to: your-email@example.com
    from: GitHub Actions
    body: 'Tests failed on Node.js ${{ matrix.node-version }}'
```

### Option 3: GitHub Notifications

GitHub automatically sends notifications for:
- Failed workflow runs
- Pull request status changes
- Commit status changes

Enable in: GitHub Settings → Notifications → Actions

### Option 4: Discord Notifications

To add Discord notifications:

```yaml
- name: Send Discord notification
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    title: 'Test Results'
    description: 'Tests ${{ job.status }} on Node.js ${{ matrix.node-version }}'
```

## Disable Notifications

If you don't want notifications, you can:
1. Remove the notification steps from `.github/workflows/tests.yml`
2. Or simply don't add the webhook secret (notifications will be skipped)

## Current Status

- ✅ GitHub Actions notifications: Enabled (automatic)
- ⏸️ Slack notifications: Configured but requires webhook secret
- ⏸️ Email notifications: Not configured
- ⏸️ Discord notifications: Not configured

## Testing Notifications

To test notifications:
1. Push a commit that will fail tests
2. Check your configured notification channel
3. Verify you receive the failure notification

---

**Note**: Notifications are optional and won't break the workflow if not configured.

