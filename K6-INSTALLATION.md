# k6 Installation Guide

## Windows Installation

### Option 1: MSI Installer (Recommended)
1. Download the latest k6 MSI installer from: https://github.com/grafana/k6/releases
2. Run the installer and follow the prompts
3. Verify installation:
   ```powershell
   k6 version
   ```

### Option 2: Chocolatey
```powershell
choco install k6
```

### Option 3: Download Binary
1. Download Windows 64-bit binary from: https://github.com/grafana/k6/releases
2. Extract to a folder (e.g., `C:\Program Files\k6`)
3. Add to PATH environment variable
4. Restart PowerShell and verify:
   ```powershell
   k6 version
   ```

## After Installation

Once k6 is installed, run load tests:

```powershell
# Standard baseline test
k6 run performance-stress-tests/load-test.js

# With results summary to file
k6 run performance-stress-tests/load-test.js --summary-export=results.json
```

## Troubleshooting

If `k6` command not found after installation:
1. Close and reopen PowerShell
2. Verify PATH includes k6 directory
3. Try full path to k6 executable:
   ```powershell
   C:\Program Files\k6\k6.exe run performance-stress-tests/load-test.js
   ```
