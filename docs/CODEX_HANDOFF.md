# Codex local continuation handoff

Repository: `https://github.com/BeatyXO/Wearline-.git`

Continue from the latest remote `main`; do not assume any earlier SHA is still current.

## Non-negotiable constraints
- Exactly one GenLayer Intelligent Contract: `contracts/Wearline.py`.
- StudioNet chain ID **61999 only**. Do not migrate to Bradbury or Studio-dev 61997.
- AI/consensus decides only condition classification + severity. Payout math stays deterministic.
- Preserve hash-bound baseline/checkout evidence and fail-closed `INCONCLUSIVE`.
- Keep the reviewer-facing frontend purple + white, responsive, and polished.

## Continue in this order
1. Pull latest main and inspect every file.
2. From `frontend/`, run `npm install`, `npm run typecheck`, and `npm run build`. Fix all SDK/TypeScript mismatches against the installed stable `genlayer-js`.
3. Install current GenLayer tooling and run `genvm-lint check contracts/Wearline.py`. Fix all compatibility issues without weakening the design.
4. Add real `genlayer-test` Direct Mode tests for authorization, sealing immutability, cap guards, exact funding, evidence restrictions, the full settlement matrix, inconclusive blocking/waiver, duplicate settlement prevention, and adversarial hashes/enums/severities.
5. Add consensus mocks/tests for all four classifications. Validators must independently reproduce consequential decision fields.
6. Run Direct Mode to green.
7. Deploy exactly one canonical Wearline contract to StudioNet 61999 from the funded local wallet. Record address, deployment tx, source commit, and contract SHA-256.
8. Execute a real lifecycle: create → 4 items → seal → fund → submit evidence → adjudicate UNCHANGED/NORMAL_WEAR/NEW_DAMAGE/INCONCLUSIVE → waive inconclusive → settle. Record all important tx hashes and final readbacks.
9. Confirm owner/renter transfers happen exactly once and match deterministic math.
10. Wire the canonical address into the frontend; finish real agreement reads, inventory entry, evidence hashing/submission, adjudication, settlement, transaction finality/execution checks, duplicate-click protection, loading/error/empty states, and explorer links.
11. Build production frontend. Deploy to Vercel if credentials exist; otherwise leave it build-clean and document exact settings.
12. Update README, DEPLOYMENT.md and add reviewer SUBMISSION.md with verified facts only.
13. Inspect GitHub Actions, fix failures, push until main is clean.
14. Final audit for genuine non-determinism, independent validation, immutable evidence binding, deterministic financial guards, adversarial tests, source/deployment parity, complete live proof, and polished UX.

Do not stop at recommendations. Edit, test, commit, push, inspect failures, and continue until only unavailable funded-wallet or Vercel-credential steps remain.
