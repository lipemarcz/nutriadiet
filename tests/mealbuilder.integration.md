# Meal Builder Integration Test Outline

- Pre-req: `.env` configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Start app: `npm run dev`.

## Scenarios
- Add meals up to 8; verify button disables with label change.
- Open dialog; search `arroz`; paginate to next page; pick 150g; add to meal; verify macros scale.
- Remove food; verify totals update.
- Add substitution; add DB food to substitution; verify substitution totals but not main meal totals.
- Reload; meals persist (localStorage).

## Expected
- No console errors.
- DB requests are GETs only; no mutations.
- Search latency typically < 500ms (network-dependent).

