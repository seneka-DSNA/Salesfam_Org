# Known Security Debt

## 🔴 Pending — Requires Developer Fix

### 1. Regex Injection / ReDoS in Company Search
- **File:** `app/api/company/route.js:120`
- **Risk:** `companyName` is received unsanitized from a query parameter and concatenated into a `RegExp`. This allows for ReDoS (server hang) and exact match bypass.
- **Suggested Fix:** Escape special regex characters before building the `RegExp`, or use an exact Mongo filter instead of `$regex`.
- **Detected by:** `eslint-plugin-security` (`detect-non-literal-regexp`), does not block CI (severity: warning).

### 2. List Elements Without `key` (5 instances)
- **Files:** `app/settings/manage-contracts/AddContract.tsx:144`, `EditContract.tsx:156`, `components/ContractTable.jsx:99`, `components/datatable.tsx:363`, `components/datatableSeller1.tsx:275`
- **Risk:** Not a security issue — it is a React bug that can cause incorrect rendering when reordering/updating lists.
- **Suggested Fix:** Add `key={unique-id}` to each iterated element.
- **Note:** Temporarily downgraded to a warning via `eslint-disable-next-line` to avoid blocking the pipeline — see comments in each file.

## 🟢 Reviewed — False Positive, No Action Required

- `components/ResetPassword.tsx:29`, `components/SetPassword.tsx:34` — Comparison between two fields of the same form, not between a secret and a stored value. No remote attacker can measure timing here.
- `components/TabComponent.tsx:23` — The index used never comes from user input, only from the `tabs` array itself rendered by the component.

## Recommended run 'npm run lint' to see other needs 

- `grep -rn "eslint-disable" --include="*.tsx" --include="*.jsx" --include="*.js" .` run it eventually to check not documented bypassed lines.