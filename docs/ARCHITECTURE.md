# Wearline architecture

Wearline is a single Intelligent Contract for requirement-bound physical remediation verification. Its core question is deliberately narrow:

> Does the completion evidence demonstrate satisfaction of the frozen remediation requirement, using the baseline only to understand the originally documented defect?

## State model

A `RemediationCase` stores the requester, remediator, title, state, derived result, item count, verified count, creation timestamp and sealed flag.

A `RemediationItem` stores the item label, defect description, baseline URL and SHA-256, frozen remediation requirement, completion URL and SHA-256, verdict, reasoning and verified flag.

The state path is intentionally small:

`DRAFT → SEALED → REVIEWING → VERIFIED`

The result is separate from lifecycle state:

- `ACCEPTED`
- `REMEDIATION_REQUIRED`
- `REVIEW_REQUIRED`

## Lifecycle

1. The requester creates a case and names the remediator.
2. The requester registers one or more items with immutable baseline evidence, defect descriptions and exact remediation requirements.
3. The requester seals the case.
4. The remediator submits one completion evidence reference per item.
5. GenLayer verifies each item.
6. When every item is verified, the contract derives the case result from the closed verdict set.

After sealing, no new item can be added. Completion evidence cannot be replaced after it has been submitted, and a verified item cannot be verified again.

## Consensus boundary

For one item, nondeterministic execution receives only:

1. registered item label;
2. documented defect description;
3. immutable baseline image;
4. frozen natural-language remediation requirement;
5. completion image.

Both images are fetched inside the nondeterministic function. HTTP status and MIME type are checked, then SHA-256 is recomputed for each image. Vision analysis runs only after both hashes match.

The model must return exactly:

```json
{"verdict":"SATISFIED","reasoning":"..."}
```

The accepted verdicts are `SATISFIED`, `PARTIALLY_SATISFIED`, `NOT_SATISFIED`, and `INCONCLUSIVE`.

Validators independently rerun the complete evidence fetch, hash verification and visual assessment. Validation compares only `verdict`; exact prose equality is intentionally unnecessary.

## Result derivation

The deterministic result function scans every final item verdict:

- if any item is `INCONCLUSIVE`, result is `REVIEW_REQUIRED`;
- otherwise, if any item is `PARTIALLY_SATISFIED` or `NOT_SATISFIED`, result is `REMEDIATION_REQUIRED`;
- otherwise every item is `SATISFIED`, so result is `ACCEPTED`.

This ordering ensures uncertain visual evidence can never become automatic acceptance.

## Frontend boundary

The React/Vite app is a client of the contract, not an authority. It mirrors the new method surface exactly, performs local URL/hash validation, supports an injected wallet on StudioNet `61999`, waits for finalized transaction execution, and renders case state plus evidence previews.

The frontend configuration deliberately has no default contract address before the fresh deployment. A missing address is displayed as **Pending deployment** rather than silently pointing at an older contract.

## Network boundary

Wearline runtime configuration targets only GenLayer StudioNet:

- chain ID `61999`;
- RPC `https://studio.genlayer.com/api`;
- explorer `https://explorer-studio.genlayer.com`.

No alternate GenLayer network is part of the active runtime configuration.
