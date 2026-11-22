# Stepora — Testing & Quality Assurance Guide

## 1. Test Suite Coverage

Stepora enforces testing across key business logic layers:
- Authentication & Session Verification
- Physical Step Count Normalization & Aggregation
- Idempotent Sync & Duplicate Elimination
- Strict Individual Challenge Calculation (Target achieved on all days)
- Group Challenge Scoring (Independent user scoring, never pooled)
- Daily & Overall Leaderboard Sorting and Tie Resolution
- 1,000-Step Motivational Event Deduplication

---

## 2. Running Automated Tests

```bash
# Run TypeScript compilation checks
npm run typecheck

# Run Code Formatting verification
npm run format:check

# Run Backend & Unit test suites
npm run test
```
