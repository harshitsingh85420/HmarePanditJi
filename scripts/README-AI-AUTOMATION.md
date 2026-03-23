# AI Tester → Qwen Code Automation

Fully automated workflow: **Gemini CLI (Antigravity engine)** tests your code → **Qwen Code** fixes issues.

## Setup

### 1. Install Gemini CLI

```bash
npm install -g @google/gemini-cli
```

### 2. Authenticate (first time only)

```bash
gemini auth
```

Follow the authentication prompts.

---

## Usage

### Run AI Tests

```bash
# Custom test prompt
pnpm ai:test "Find all bugs in the authentication flow"

# Run all tests
pnpm ai:test --test

# Code review
pnpm ai:review
```

### Get Fixes from Qwen Code

After tests complete, tell Qwen Code:

```
Check test-results/ and fix the issues
```

Or use the helper:

```bash
pnpm ai:fix
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. Run AI Tester                                           │
│     pnpm ai:test "Find bugs"                                │
│     ↓                                                       │
│  2. Gemini CLI (Antigravity) runs tests                     │
│     ↓                                                       │
│  3. Results saved to test-results/                          │
│     - result-TIMESTAMP.json  (raw JSON)                     │
│     - report-TIMESTAMP.md    (human readable)               │
│     ↓                                                       │
│  4. Tell Qwen Code: "Check test-results/ and fix"           │
│     ↓                                                       │
│  5. Qwen Code reads results and provides fixes              │
└─────────────────────────────────────────────────────────────┘
```

---

## Output Files

| File | Description |
|------|-------------|
| `test-results/result-*.json` | Raw JSON output with response and stats |
| `test-results/report-*.md` | Human-readable markdown report |
| `test-results/error-*.md` | Error report (if CLI fails) |

---

## Advanced Usage

### Custom Model

```bash
node scripts/run-ai-tester.js "Find security issues" --model gemini-2.5-pro
```

### Auto-Approve Actions (YOLO Mode)

```bash
node scripts/run-ai-tester.js "Fix all bugs" --yolo
```

### Specify Result File

```bash
node scripts/qwen-fix.js --file test-results/result-xxx.json
```

---

## Example Workflow

```bash
# Step 1: Run comprehensive test
pnpm ai:test "Run all tests, find failures, security issues, and performance problems"

# Step 2: Tell Qwen Code (in chat)
# "Check test-results/ and fix all issues found"

# Step 3: Qwen Code reads the report and provides fixes
# Step 4: Review and apply fixes
```

---

## Troubleshooting

### "gemini: command not found"
Install Gemini CLI globally: `npm install -g @google/gemini-cli`

### Authentication errors
Run `gemini auth` to authenticate

### No test-results found
Run `pnpm ai:test` first to generate results

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm ai:test "<prompt>"` | Run AI tester with custom prompt |
| `pnpm ai:test --test` | Run all tests |
| `pnpm ai:review` | Full code review |
| `pnpm ai:fix` | Prepare latest results for Qwen Code |

---

## Architecture

- **Gemini CLI**: Uses Antigravity AI engine (Gemini models)
- **Headless Mode**: Non-interactive, scriptable execution
- **JSON Output**: Structured results for programmatic access
- **Qwen Code**: Reads results and provides developer fixes
