# Wearline architecture

Wearline separates subjective observation from financial authority.

The non-deterministic layer answers only: which closed classification best describes visible condition change, and—only for `NEW_DAMAGE`—which severity bucket applies. Everything else is deterministic contract logic.

## Lifecycle

`DRAFT → SEALED → FUNDED → REVIEWING → READY_TO_SETTLE → SETTLED`

The owner freezes the property label, renter, policy, inventory, baseline evidence digests and per-item caps before funding. The renter funds the exact deposit and later submits checkout evidence. Validators independently compare each pair. Settlement becomes available only after every item is adjudicated.

## Consensus boundary

For each item the contract fetches baseline and checkout evidence, rejects non-2xx responses and unsupported content types, verifies both frozen SHA-256 digests, then sends exactly those two images to the vision model. Validators independently repeat the same assessment and require exact agreement on `classification` and `severity`.

The accepted classifications are `UNCHANGED`, `NORMAL_WEAR`, `NEW_DAMAGE`, and `INCONCLUSIVE`.

Rationale is stored for user/reviewer visibility but it is not allowed to change financial logic.

## Deterministic settlement

- unchanged → 0
- normal wear → 0
- inconclusive → 0 and settlement blocked until owner waiver
- new damage severity 1 → 25% of frozen item cap
- new damage severity 2 → 60%
- new damage severity 3 → 100%

The sum of all item caps must not exceed the deposit before sealing.

## Frontend boundary

The web app is UX, not settlement authority. The contract remains authoritative if the frontend is modified or replaced.

## Verification

The GenVM linter passes, and `gltest tests/direct_mode_suite.py -q` passes 20 Direct Mode tests without network transactions. GitHub Actions also passes source checks and the frontend build. The canonical StudioNet deployment is source-pinned, and two live agreements have finalized; transaction and balance evidence is in [SUBMISSION.md](../SUBMISSION.md). Live consensus classified the four-item example as `UNCHANGED`, `NEW_DAMAGE`, and `INCONCLUSIVE`; a second agreement verified `NORMAL_WEAR`.
