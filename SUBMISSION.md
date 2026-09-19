# Wearline — pre-deployment reviewer status

## Purpose

Wearline is a physical remediation verification protocol. A requester freezes the original defect evidence and an exact natural-language completion requirement. A remediator later submits hash-bound completion evidence. GenLayer independently interprets the exact before/after visual pair and decides only whether the frozen requirement is satisfied.

## Bounded verdicts

- `SATISFIED`
- `PARTIALLY_SATISFIED`
- `NOT_SATISFIED`
- `INCONCLUSIVE`

The model returns only `verdict` and `reasoning`. Validators independently rerun the assessment and compare only the consequential verdict. `INCONCLUSIVE` fails closed to `REVIEW_REQUIRED` at case level.

## Contract lifecycle

`DRAFT → SEALED → REVIEWING → VERIFIED`

The requester creates the case and registers items. Each item freezes its defect description, baseline HTTPS evidence, baseline SHA-256 and exact remediation requirement. After sealing, the remediator can submit one completion URL and SHA-256 per item. GenLayer verification stores the final item verdict and reasoning. Once every item is verified, the contract derives one of:

- `ACCEPTED`
- `REMEDIATION_REQUIRED`
- `REVIEW_REQUIRED`

## Safety properties

- both evidence images are fetched inside nondeterministic execution;
- both hashes are verified before vision analysis;
- non-success responses and unsupported image types fail closed;
- visible image text is treated as untrusted evidence;
- the model cannot invent an additional requirement;
- the verdict enum is closed;
- validators independently reassess the evidence;
- completion evidence cannot be overwritten;
- duplicate verification is rejected;
- there is no direct success override;
- there are no value-bearing contract methods or transfer-emission calls.

## Frontend

The interface exposes only the remediation workflow: Home, Case, Evidence and Report. It preserves StudioNet wallet connection, network switching, transaction-finality checks, local hashing, URL hashing, evidence previews, explorer links and the responsive visual identity.

The active environment templates intentionally leave `VITE_WEARLINE_CONTRACT_ADDRESS` blank until the fresh deployment exists.

## Current release boundary

- StudioNet network: `61999`
- Fresh contract address: **PENDING DEPLOYMENT**
- Fresh deployment transaction: **PENDING DEPLOYMENT**
- Live lifecycle proof: **PENDING DEPLOYMENT**
- Frontend contract wiring: **PENDING DEPLOYMENT**

No live StudioNet lifecycle is claimed in this phase. The next phase begins only after explicit authorization to deploy the fresh contract.
