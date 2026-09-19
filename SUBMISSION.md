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
- `gltest tests/test_direct.py -q`: 20 GenLayer Direct Mode tests passed, including authorization, agreement and funding rules, all classifications and deduction percentages, inconclusive waiver, validator reassessment, settlement arithmetic, and adversarial evidence responses.
- `python -m unittest discover -s tests -v`: 9 supplementary source-invariant tests passed.
- Frontend `npm run typecheck` and `npm run build`: passed in GitHub Actions run 35441773111 for commit `8af51a9656ea4a5934a5af4e742ff04e81f43647`. Further pending edits require a fresh CI run.

Direct Mode executes contract behavior locally without a StudioNet transaction. It does not prove live validator convergence, wallet transfer behavior, or transaction finality.

## Deployment and lifecycle proof

No canonical Wearline contract address, deployment transaction, deployed source commit, or source digest is recorded. No live lifecycle transaction hashes or balance proof have been generated. The local GenLayer CLI reports StudioNet chain ID 61999. Dedicated owner and renter accounts exist; no funding transfer or contract deployment has been submitted.

No Vercel URL is recorded. Configure `VITE_WEARLINE_CONTRACT_ADDRESS` with the verified StudioNet contract address after deployment.
