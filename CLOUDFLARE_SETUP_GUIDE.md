# 🚀 Cloudflare Workers Setup Guide

## PREREQUISITE: Create KV Namespace First!

Before deploying the Events Worker, you need to create a KV namespace.

### Step 1: Create Events KV Namespace

```powershell
cd cloudflare-workers\empowrapp-events
wrangler kv:namespace create "EVENTS_KV"
```

**Output will look like:**
```
🌀 Creating namespace with title "3mpwrapp-calendar-EVENTS_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "EVENTS_KV", id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" }
```

### Step 2: Update wrangler.toml

Copy the ID from the output above and update `cloudflare-workers/empowrapp-events/wrangler.toml`:

**BEFORE:**
```toml
[[kv_namespaces]]
binding = "EVENTS_KV"
id = "YOUR_KV_ID_HERE"
```

**AFTER:**
```toml
[[kv_namespaces]]
binding = "EVENTS_KV"
id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  # Replace with YOUR actual ID
```

### Step 3: Deploy Events Worker

```powershell
cd cloudflare-workers\empowrapp-events
wrangler deploy
```

### Step 4: Deploy Campaigns Worker (Already Has KV ID)

```powershell
cd ..\empowrapp-campaigns
wrangler deploy
```

### Step 5: Test Deployments

```powershell
# Test Events Worker
curl https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health

# Test Campaigns Worker
curl https://empowrapp-campaigns.empowrapp08162025.workers.dev/health
```

## Alternative: Deploy Without KV (Testing Only)

If you want to test without KV storage, you can temporarily remove the KV binding:

**Edit `wrangler.toml`:**
```toml
# Comment out KV namespace temporarily
# [[kv_namespaces]]
# binding = "EVENTS_KV"
# id = "YOUR_KV_ID_HERE"
```

**Then deploy:**
```powershell
wrangler deploy
```

⚠️ **Warning**: Without KV storage, events won't persist. This is only for testing the API endpoints.

## Troubleshooting

### Error: "KV namespace 'YOUR_KV_ID_HERE' is not valid"
- **Solution**: You forgot to create the KV namespace. Run Step 1 above.

### Error: "Authentication error"
- **Solution**: Login to Cloudflare: `wrangler login`

### Error: "Workers.dev subdomain not available"
- **Solution**: Remove `workers_dev = true` from wrangler.toml

### Error: "Script too large"
- **Solution**: The worker code is fine. This usually means node_modules got bundled. Check your .gitignore.

## Quick Setup Script

Or use the automated script (after creating KV namespace):

```powershell
# 1. Create KV namespace
cd cloudflare-workers\empowrapp-events
.\setup-kv.ps1

# 2. Manually update wrangler.toml with the KV ID from output

# 3. Deploy both workers
cd ..\..
.\scripts\deploy-workers-only.ps1
```

## Summary

✅ **Events Worker**: Requires KV namespace creation first
✅ **Campaigns Worker**: Already configured (KV ID: 735bf388954b4dbeb6f8b5d357b1e5ed)

**Total Time**: ~5 minutes
**Cost**: FREE (Cloudflare free tier includes 100k reads/day + 1k writes/day)
