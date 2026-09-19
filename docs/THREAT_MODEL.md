# Wearline threat model

## Mutable evidence
Evidence URLs are paired with frozen SHA-256 digests. Validators hash fetched bytes before vision analysis; changed content fails closed. Non-2xx responses and unsupported MIME types are rejected before image analysis.

## Prompt injection in images
The model is explicitly told that visible text is untrusted evidence and never an instruction. Output is constrained to a closed classification/severity space.

## Model invents money
The model never returns a repair price or payout. Deductions are derived only from frozen item caps and the deterministic 25/60/100% matrix.

## Leader-only judgment
Validators independently fetch and reassess the evidence. Validation requires equality of the consequential classification and severity fields.

## Ambiguous photography
`INCONCLUSIVE` is first-class: zero deduction and settlement blocked. Owner waiver can only reduce owner recovery.

## Cap inflation
Items and caps can only be registered before sealing. Sealed agreements accept no new inventory.

## Over-allocation
Sealing rejects an agreement when the sum of item caps exceeds the required deposit.

## Funding / settlement integrity
Only the registered renter may fund the exact frozen deposit. Settlement changes state before transfer emissions and cannot execute twice.

## Verification boundaries
The deployed source has been matched byte-for-byte to its pinned repository source and three live StudioNet agreements have completed. A four-item lifecycle demonstrated all four classes together, inconclusive blocking/waiver, successful transfers, and exact balances; duplicate settlement rejection was also verified. Direct Mode covers baseline/checkout digest mismatch, inaccessible resources, non-success redirects, unsupported content, identical images, and a prompt-injection image fixture. Remaining evidence-host checks include real redirect-to-image behavior, image framing/size extremes, and repeated validator convergence over broader real photographs.
