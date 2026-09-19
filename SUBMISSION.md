# Wearline submission status

Wearline is a GenLayer security-deposit settlement application. It uses consensus for visual condition classification and severity, while the contract calculates every deduction deterministically from a frozen item cap.

## Design

The single Intelligent Contract is `contracts/Wearline.py`. Only `UNCHANGED`, `NORMAL_WEAR`, `NEW_DAMAGE`, and `INCONCLUSIVE` are accepted. Consensus can return a classification, severity, and factual rationale. It cannot return a price, deduction, recipient, or payout.

For `NEW_DAMAGE`, severity 1 deducts 25% of the item cap, severity 2 deducts 60%, and severity 3 deducts 100%. Other classifications deduct zero. `INCONCLUSIVE` blocks settlement until an owner waiver; waiver does not increase the deduction. Item caps must fit within the exact frozen deposit.

The lifecycle is `DRAFT → SEALED → FUNDED → REVIEWING → READY_TO_SETTLE → SETTLED`. Owner and renter authorization is checked on their respective operations. Items cannot be added after sealing, funding requires the exact deposit, and settlement changes state before transfer messages are emitted.

## Evidence and consensus

The contract accepts HTTPS evidence URLs and validates 64-character hexadecimal SHA-256 digests. During adjudication, it fetches both resources, hashes the returned bytes, and rejects mismatches before sending the two images to the vision prompt. The prompt treats visible text as untrusted. Validators independently run the assessment and must reproduce classification and severity; rationale is not consequential. Payout arithmetic runs only after consensus returns.

## Verification completed in this workspace

- `genvm-lint check contracts/Wearline.py`: passed locally (3 checks, 13 methods).
- `python -m unittest discover -s tests -v`: 9 supplementary source-invariant tests passed.
- `npm run typecheck`: passed after correcting the TypeScript project configuration and updating calls to the installed `genlayer-js` API.
- `npm run build`: TypeScript passed, but Vite/esbuild could not read a parent directory outside the writable workspace. A production build is therefore not verified.

These results do not constitute GenLayer Direct Mode lifecycle tests or StudioNet execution tests. `genlayer-test` is not installed in the available environment. Network access to GitHub and the npm registry was unavailable during this run.

## Deployment and lifecycle proof

No canonical Wearline contract address, deployment transaction, deployed source commit, or source digest is recorded. No live lifecycle transaction hashes or balance proof have been generated. The local GenLayer CLI is configured for StudioNet chain ID 61999, but this alone does not prove a deployment or authorize spending from the unrelated active CLI account.

No Vercel URL is recorded. Configure `VITE_WEARLINE_CONTRACT_ADDRESS` with the verified StudioNet contract address after deployment.
