# 🔄 Auto-Fix Loop - Automated Testing + AI Fixing

Fully automated test → analyze → fix loop using DeepSeek AI.

## 🚀 Quick Start

```bash
# Run the auto-fix loop
pnpm auto:fix

# Dry run (analyze only, no actual fixes)
pnpm auto:fix:dry

# List available backups
pnpm auto:fix:list

# Restore latest backup
pnpm auto:fix:restore
```

## 📋 How It Works

```
┌─────────────────┐
│  1. Run Tests   │ → Executes your test script
└─────────────────┘
         ↓
┌─────────────────┐
│  2. Capture     │ → Saves test output to file
│     Output      │
└─────────────────┘
         ↓
┌─────────────────┐
│  3. AI Analyzes │ → DeepSeek API analyzes failures
│     & Suggests  │ → Generates fix plan (JSON)
│     Fixes       │
└─────────────────┘
         ↓
┌─────────────────┐
│  4. Apply       │ → Creates backup, applies fixes
│     Fixes       │ → Replaces code in files
└─────────────────┘
         ↓
┌─────────────────┐
│  5. Loop        │ → Repeat from step 1 (max 3 iterations)
└─────────────────┘
```

## ⚙️ Configuration

Edit `auto-fix.config.json`:

```json
{
  "test": {
    "command": "node browser-test.js",  // Your test command
    "timeout": 120000,                   // 2 minutes per test
    "retryDelay": 5000                   // 5s between iterations
  },
  "loop": {
    "maxIterations": 3,                  // Stop after 3 attempts
    "stopOnFirstSuccess": true           // Stop when tests pass
  },
  "safety": {
    "backupBeforeFix": true,             // Always backup before changes
    "backupDirectory": "backups/auto-fix"
  }
}
```

## 🛡️ Safety Features

| Feature | Description |
|---------|-------------|
| **Backups** | Every file is backed up before modification |
| **Max Iterations** | Stops after 3 attempts to prevent infinite loops |
| **Dry Run Mode** | Test the loop without applying fixes |
| **Restore** | Quickly restore from any backup |
| **Reports** | Every iteration is saved for review |

## 📁 Output Directories

```
project/
├── backups/auto-fix/       # File backups before changes
├── auto-fix-reports/       # JSON reports for each iteration
├── test-outputs/           # Raw test output files
└── scripts/
    ├── auto-fix-loop.js    # Main loop script
    └── restore-backup.js   # Backup restoration
```

## 🎯 Usage Examples

### Basic Usage

```bash
# Run with default settings (uses browser-test.js)
pnpm auto:fix
```

### Custom Test Script

```bash
node scripts/auto-fix-loop.js --test path/to/your-test.js
```

### Dry Run (Recommended First)

```bash
# See what the AI would fix without applying changes
pnpm auto:fix:dry
```

### More Control

```bash
# Run up to 5 iterations
node scripts/auto-fix-loop.js --max-iterations 5

# Dry run with custom test
node scripts/auto-fix-loop.js --test my-test.js --dry-run

# Skip backups (not recommended)
node scripts/auto-fix-loop.js --no-backup
```

### Restore from Backup

```bash
# List all backups
pnpm auto:fix:list

# Restore most recent
pnpm auto:fix:restore

# Restore specific backup
node scripts/restore-backup.js --file browser-test.js.2026-03-23T10-30-00.bak
```

## 🔍 Understanding the Reports

Each iteration creates a report in `auto-fix-reports/`:

```json
{
  "iteration": 1,
  "testResult": {
    "success": false,
    "output": "...test output...",
    "duration": "45.23"
  },
  "fixPlan": {
    "analysis": "Found 3 issues...",
    "fixes": [...],
    "confidence": "high"
  },
  "applyResult": {
    "applied": 2,
    "failed": 1
  }
}
```

## ⚠️ Important Notes

1. **Always run dry-run first** to see what the AI plans to change
2. **Review backups** if something goes wrong
3. **Max 3 iterations** by default to prevent runaway loops
4. **API costs** - Each iteration uses DeepSeek API calls
5. **Not all fixes work** - Some issues need human intervention

## 🛠️ Troubleshooting

### Tests still failing after loop?

1. Check `auto-fix-reports/` for what the AI tried
2. Review `test-outputs/` for remaining failures
3. Some issues may need manual fixes
4. Try increasing `maxIterations` to 5

### AI fixes not applying?

1. Check if file paths in fix plan are correct
2. Some fixes may not match exact code (oldCode not found)
3. Review reports to see what went wrong
4. Restore from backup and try again

### Want to use a different AI?

Edit `scripts/auto-fix-loop.js`:
- Change `DEEPSEEK_API_URL` to your preferred API
- Update the API call in `generateFix()` function

## 📞 Commands Summary

| Command | Description |
|---------|-------------|
| `pnpm auto:fix` | Run auto-fix loop |
| `pnpm auto:fix:dry` | Dry run (no changes) |
| `pnpm auto:fix:list` | List backups |
| `pnpm auto:fix:restore` | Restore latest backup |

---

**Built with DeepSeek AI** 🤖  
**Part of HmarePanditJi** 🙏
