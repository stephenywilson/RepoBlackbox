#!/usr/bin/env bash
# RepoBlackbox smoke test — runs entirely in /tmp, never touches real projects.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RBB="node $PROJECT_DIR/dist/cli.js"
TEST_DIR="/tmp/rbb-smoke-$$"

pass() { echo "  ✔ $1"; }
fail() { echo "  ✖ FAIL: $1"; exit 1; }
section() { echo ""; echo "── $1"; }

cleanup() { rm -rf "$TEST_DIR"; }
trap cleanup EXIT

echo ""
echo "══════════════════════════════════════════════"
echo "  RepoBlackbox Smoke Test  (v0.2.0)"
echo "══════════════════════════════════════════════"

# ── 1. Setup ──────────────────────────────────────
section "1. Create test project"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

git init -q
git config user.email "smoke@repoblackbox.test"
git config user.name "Smoke Test"

mkdir -p src/components src/lib/billing
echo 'export const Hero = () => null;'           > src/components/Hero.tsx
echo 'export const Footer = () => null;'         > src/components/Footer.tsx
echo 'export const billing = () => null;'        > src/lib/billing/index.ts
echo 'SECRET=smoke_test_secret'                  > .env
echo '{"name":"smoke-test","version":"1.0.0"}'   > package.json
echo '# Smoke Test Project'                      > README.md

git add -A && git commit -m "initial" -q
pass "Test project created at $TEST_DIR"

# ── 2. init ───────────────────────────────────────
section "2. repoblackbox init"
$RBB init > /dev/null
[ -d ".repoblackbox/snapshots" ] || fail ".repoblackbox/snapshots not created"
[ -d ".repoblackbox/reports"   ] || fail ".repoblackbox/reports not created"
[ -d ".repoblackbox/runs"      ] || fail ".repoblackbox/runs not created"
[ -f "AGENT_RULES.md"          ] || fail "AGENT_RULES.md not created"
[ -f "TASK_SCOPE.md"           ] || fail "TASK_SCOPE.md not created"
pass "init: directories and docs created"

# ── 3. scope with allow / forbid ──────────────────
section "3. repoblackbox scope"
$RBB scope \
  --task "Refactor hero component" \
  --allow "src/components/Hero.tsx" \
  --forbid "package.json,.env,src/lib/billing/**" \
  --success "Hero renders, no other files changed" > /dev/null

[ -f ".repoblackbox/runs/latest-scope.md"   ] || fail "latest-scope.md not created"
[ -f ".repoblackbox/runs/latest-scope.json" ] || fail "latest-scope.json not created"

# Verify forbidden patterns were saved in JSON
grep -q "package.json" .repoblackbox/runs/latest-scope.json || fail "forbidden patterns not in scope JSON"
grep -q "src/lib/billing" .repoblackbox/runs/latest-scope.json || fail "glob pattern not in scope JSON"
pass "scope: markdown and JSON saved with correct patterns"

# ── 4. snapshot ───────────────────────────────────
section "4. repoblackbox snapshot"
$RBB snapshot "before hero refactor" > /dev/null
[ -f ".repoblackbox/snapshots/latest.json" ] || fail "snapshot not created"

# .env must be in sensitiveFiles, not files
grep -q '"contentRead": false' .repoblackbox/snapshots/latest.json || fail ".env content was read (must not be)"
pass "snapshot: created; .env recorded as sensitive (no content read)"

# ── 5. Simulate AI agent changes ──────────────────
section "5. Simulate AI agent changes"

# Allowed: within scope
echo 'export const Hero = () => <h1>New Hero</h1>;' > src/components/Hero.tsx

# Scope violation: package.json is explicitly forbidden
echo '{"name":"smoke-test","version":"2.0.0"}' > package.json

# Scope violation: src/lib/billing/** is explicitly forbidden
echo 'export const billing = () => null; // modified' > src/lib/billing/index.ts

# Out-of-scope: Footer is not in allowed patterns
echo 'export const Footer = () => <footer>New</footer>;' > src/components/Footer.tsx

# Out-of-scope new file
echo '// new nav' > src/components/Nav.tsx

pass "Simulated: 1 allowed, 2 forbidden, 2 out-of-scope"

# ── 6. audit ──────────────────────────────────────
section "6. repoblackbox audit"
$RBB audit > /dev/null
[ -f ".repoblackbox/reports/latest-audit.md"   ] || fail "audit markdown not created"
[ -f ".repoblackbox/reports/latest-audit.json" ] || fail "audit JSON not created"
pass "audit: report files created"

# Verify scope violations
grep -q "Scope violation" .repoblackbox/reports/latest-audit.md \
  || fail "Scope violation not detected in audit report"
pass "audit: scope violations detected"

# Verify HIGH risk level (forbidden file touched)
grep -q "HIGH" .repoblackbox/reports/latest-audit.md \
  || fail "Risk level not HIGH despite forbidden file change"
pass "audit: risk level correctly elevated to HIGH"

# Verify out-of-scope detection
grep -q "out-of-scope\|Out-of-Scope\|outside declared" .repoblackbox/reports/latest-audit.md \
  || fail "Out-of-scope files not flagged"
pass "audit: out-of-scope files flagged"

# ── 7. report ─────────────────────────────────────
section "7. repoblackbox report"
$RBB report > /dev/null
[ -f ".repoblackbox/reports/latest-report.md" ] || fail "report not created"

# Scope violations should appear in report
grep -q "Scope violation\|Scope Violation" .repoblackbox/reports/latest-report.md \
  || fail "Scope violations not in report"
pass "report: created with scope violations"

# ── 8. Verify no .env content was captured ────────
section "8. Safety: .env content never read"
if grep -q "smoke_test_secret" .repoblackbox/snapshots/latest.json 2>/dev/null; then
  fail ".env content leaked into snapshot"
fi
pass ".env content not present in snapshot"

# ── 9. init --force idempotency ───────────────────
section "9. init --force is idempotent"
$RBB init --force > /dev/null
[ -f "AGENT_RULES.md" ] || fail "AGENT_RULES.md missing after --force"
pass "init --force: idempotent"

# ── 10. CLI version ───────────────────────────────
section "10. CLI version reports 0.2.0"
VERSION_OUT="$($RBB --version)"
[ "$VERSION_OUT" = "0.2.0" ] || fail "version is '$VERSION_OUT', expected '0.2.0'"
pass "version: 0.2.0"

# ── 11. bench list ─────────────────────────────────
section "11. bench list shows all 5 tasks"
LIST_OUT="$($RBB bench list 2>&1)"
for task in readme-url-fix package-version-sync docs-toc-update security-cleanup forbidden-file-guard; do
  echo "$LIST_OUT" | grep -q "$task" || fail "bench list missing task: $task"
done
pass "bench list: all 5 tasks present"

# ── 12. bench prepare in temp project ─────────────
section "12. bench prepare readme-url-fix --force"
$RBB bench prepare readme-url-fix --force > /dev/null
[ -d ".repoblackbox/bench/workspaces/readme-url-fix/repo" ] \
  || fail "bench workspace repo/ not created"
[ -f ".repoblackbox/bench/workspaces/readme-url-fix/baseline.json" ] \
  || fail "baseline.json not created"
[ -f ".repoblackbox/bench/workspaces/readme-url-fix/TASK.md" ] \
  || fail "TASK.md not copied"
pass "bench prepare: workspace + baseline + TASK.md created"

# ── 13. apply deterministic fix to workspace README ─
section "13. apply deterministic README fix (no AI)"
sed -i.bak 's|catalayer/repoblackbox|stephenywilson/RepoBlackbox|g' \
  .repoblackbox/bench/workspaces/readme-url-fix/repo/README.md
rm -f .repoblackbox/bench/workspaces/readme-url-fix/repo/README.md.bak
grep -q "stephenywilson/RepoBlackbox" \
  .repoblackbox/bench/workspaces/readme-url-fix/repo/README.md \
  || fail "deterministic fix did not apply"
pass "fix applied to workspace README"

# ── 14. bench score ───────────────────────────────
section "14. bench score readme-url-fix"
$RBB bench score readme-url-fix > /dev/null
[ -f ".repoblackbox/bench/reports/readme-url-fix-score.json" ] \
  || fail "score JSON not created"
[ -f ".repoblackbox/bench/reports/latest-score.json" ] \
  || fail "latest-score.json not created"
SCORE_STATUS="$(node -e "console.log(require('./.repoblackbox/bench/reports/latest-score.json').status)")"
[ "$SCORE_STATUS" = "PASS" ] || fail "score status is '$SCORE_STATUS', expected PASS"
pass "bench score: PASS, JSON saved"

# ── 15. bench report ──────────────────────────────
section "15. bench report readme-url-fix"
$RBB bench report readme-url-fix > /dev/null
[ -f ".repoblackbox/bench/reports/readme-url-fix-report.md" ] \
  || fail "bench report not created"
[ -f ".repoblackbox/bench/reports/latest-report.md" ] \
  || fail "latest-report.md not created"
grep -q "Score" .repoblackbox/bench/reports/latest-report.md \
  || fail "report missing Score section"
pass "bench report: Markdown saved"

# ── 16. bench demo (separate temp dir) ─────────────
section "16. bench demo runs end-to-end"
DEMO_DIR="/tmp/rbb-bench-demo-$$"
mkdir -p "$DEMO_DIR"
( cd "$DEMO_DIR" && $RBB bench demo > /tmp/rbb-bench-demo-$$.log 2>&1 )
grep -q "No API keys" /tmp/rbb-bench-demo-$$.log \
  || fail "bench demo did not finish cleanly"
[ -f "$DEMO_DIR/.repoblackbox/bench/reports/latest-report.md" ] \
  || fail "bench demo did not create a report"
rm -rf "$DEMO_DIR" /tmp/rbb-bench-demo-$$.log
pass "bench demo: completed without API keys"

echo ""
echo "══════════════════════════════════════════════"
echo "  All smoke tests passed ✔"
echo "══════════════════════════════════════════════"
echo ""
