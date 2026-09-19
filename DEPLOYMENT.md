# Wearline StudioNet deployment status

The remediation-verification pivot is intentionally at the **pre-deployment** boundary.

| Field | Current value |
| --- | --- |
| Network | GenLayer StudioNet |
| Chain ID | `61999` (`0xf22f`) |
| RPC | `https://studio.genlayer.com/api` |
| Explorer | `https://explorer-studio.genlayer.com` |
| Fresh contract address | **PENDING DEPLOYMENT** |
| Fresh deployment transaction | **PENDING DEPLOYMENT** |
| Source commit used for deployment | **PENDING DEPLOYMENT** |
| Source SHA-256 | **PENDING DEPLOYMENT** |
| Live case IDs | **PENDING DEPLOYMENT** |
| Production frontend release | **PENDING DEPLOYMENT** |

## Pre-deployment gate

Before a fresh contract is sent to StudioNet, the repository must have:

- passing GenVM lint;
- passing Direct Mode suite;
- passing source-invariant checks;
- passing repository terminology check;
- passing frontend TypeScript and production build;
- a pushed commit that is the exact deployment source.

No historical contract address belongs in `.env.example`, `frontend/.env.example`, the active frontend, or reviewer documentation.

## Next authorized phase

Only after explicit authorization:

1. deploy `contracts/Wearline.py` to StudioNet `61999`;
2. record the fresh contract address, transaction and exact source commit/hash;
3. configure `VITE_WEARLINE_CONTRACT_ADDRESS` with that fresh address;
4. run live cases demonstrating all four verdicts and all three case results where practical;
5. record the relevant transaction evidence;
6. build and publish the frontend against the fresh contract.

This file intentionally contains no invented address or transaction.
