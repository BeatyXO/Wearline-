# Wearline

**Consensus security-deposit settlement on GenLayer StudioNet (chain ID 61999).**

Wearline is a single Intelligent Contract plus a reviewer-facing web application for settling security deposits from immutable before/after visual evidence. GenLayer validators classify **condition change**; deterministic contract logic computes **money**.

## Why Wearline belongs on GenLayer

A normal smart contract can hold a deposit and execute arithmetic, but it cannot reliably decide whether a photographed item is unchanged, normally worn, newly damaged, or impossible to compare. Wearline isolates that non-deterministic judgment and makes every financial consequence deterministic.

Each inventory item freezes:

- a baseline evidence URL and SHA-256 digest;
- a maximum deduction cap;
- the agreement's normal-wear policy.

At checkout, the renter submits a second evidence URL and SHA-256 digest. Validators independently fetch the exact bytes, verify both hashes, compare the two images, and agree only on two consequential fields: `classification` and `severity`. The contract derives the deduction from the immutable cap.

The model **cannot** invent a price, recipient, extra item, new rule, or payout percentage.

## Settlement matrix

| Consensus result | Severity | Deterministic deduction |
| --- | ---: | ---: |
| `UNCHANGED` | 0 | 0% of item cap |
| `NORMAL_WEAR` | 0 | 0% of item cap |
| `INCONCLUSIVE` | 0 | 0% and settlement blocked until owner waives it |
| `NEW_DAMAGE` | 1 | 25% of item cap |
| `NEW_DAMAGE` | 2 | 60% of item cap |
| `NEW_DAMAGE` | 3 | 100% of item cap |

The sum of item caps may never exceed the deposit.

## Architecture

- **Network:** GenLayer StudioNet, chain ID `61999`
- **Contract count:** exactly one (`contracts/Wearline.py`)
- **Frontend:** React + Vite + TypeScript
- **SDK:** `genlayer-js`
- **Wallet:** injected EIP-1193 wallet
- **Evidence:** HTTPS resources with frozen SHA-256 digests
- **Consensus:** custom `gl.vm.run_nondet_unsafe` leader/validator flow
- **Vision input:** exactly two images per adjudication (baseline + checkout)

## Lifecycle

`DRAFT → SEALED → FUNDED → REVIEWING → READY_TO_SETTLE → SETTLED`

1. Owner creates an agreement.
2. Owner adds inventory and immutable baseline evidence.
3. Owner seals the agreement. After sealing, item caps and policies cannot change.
4. Renter funds the exact deposit in GEN.
5. Renter submits checkout evidence per item.
6. Any caller may trigger adjudication; validators independently compare the evidence.
7. Inconclusive items must be explicitly waived by the owner before settlement.
8. Either party may settle once every item is resolved.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_WEARLINE_CONTRACT_ADDRESS` to the verified StudioNet deployment to enable writes. The current screen still contains preview/sample presentation and is not yet a complete live agreement workflow. Do not present preview figures as on-chain state.

## Contract development

The contract intentionally follows current GenLayer storage and consensus patterns: storage-safe dataclasses, `TreeMap`, fixed-width integers, storage copied to memory before non-deterministic work, external web/LLM calls inside the consensus block, and side effects only after consensus.

The local GenVM linter and GenLayer Direct Mode tests pass for the current source. Direct Mode runs against the production contract runtime without sending transactions. StudioNet deployment and lifecycle integration remain separate live-network checks; see [SUBMISSION.md](SUBMISSION.md) for verified results and limits. Pin the deployed source commit and record the canonical address/transaction in `DEPLOYMENT.md` before calling the application deployed.

## Evidence safety

Wearline treats image text as untrusted data, verifies content hashes before vision analysis, rejects non-HTTPS evidence, constrains outputs to a closed enum, and independently reproduces classification decisions at validators. See `docs/THREAT_MODEL.md`.

## Current status

The contract and local Direct Mode suite are implemented. Dedicated owner and renter wallets have been created for StudioNet testing; deployment and end-to-end settlement proof are still pending.
