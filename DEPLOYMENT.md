# Canonical StudioNet deployment

Wearline has one canonical Intelligent Contract deployment on GenLayer StudioNet (`61999`). It was deployed from a clean, pushed GitHub `main` commit after the Direct Mode suite, contract lint, and GitHub Actions checks passed.

| Field | Verified value |
| --- | --- |
| Network | GenLayer StudioNet |
| Chain ID | `61999` (`0xf22f`) |
| Contract address | [`0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06`](https://explorer-studio.genlayer.com/address/0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06) |
| Deployment transaction | [`0x26ff7e5b2db548ba830a576a4f8c634ac3e92f7267b3d3cd0628d01133de55d3`](https://explorer-studio.genlayer.com/tx/0x26ff7e5b2db548ba830a576a4f8c634ac3e92f7267b3d3cd0628d01133de55d3) |
| Deployment finality | `FINALIZED`; explorer GenVM result `SUCCESS`; consensus `MAJORITY_AGREE` |
| Deployed source commit | `e4ca067787d2e09d2f783464f846ada71901c03f` |
| SHA-256 of `contracts/Wearline.py` | `1632CE639645656CCA7F331679ADAF6CBF48300980E4988D8DB593148FA659B2` |
| Source parity | Retrieved StudioNet code matched the pinned repository file byte-for-byte after newline normalization; SHA-256 matched |
| Deployer | `0xf8d28f6510bf8faf6aa5c0d7a2fa41d9d018d5b3` |
| Explorer | [StudioNet contract page](https://explorer-studio.genlayer.com/address/0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06) |

The contract source commit remains `e4ca067…`; later `main` commits add only documentation and immutable demonstration evidence. They do not change `contracts/Wearline.py`.

## Frontend configuration

The repository-level [`vercel.json`](vercel.json) configures Vercel for the frontend in this repository:

| Setting | Value |
| --- | --- |
| Root directory | repository root |
| Framework preset | Vite |
| Install command | `npm --prefix frontend install` |
| Build command | `npm --prefix frontend run build` |
| Output directory | `frontend/dist` |

The production frontend is deployed and browser-verified:

| Field | Value |
| --- | --- |
| Production URL | [`https://wearline.vercel.app`](https://wearline.vercel.app) |
| Vercel deployment ID | `dpl_H1cHRYfE52SEFww1oxtyStRQbL4r` |
| Deployment status | `READY`, target `production` |
| Source commit | `0df4a6c642b69bf0b8a51a12077b43d3f10cadb0` |

Set this production environment variable to connect the frontend to the canonical contract. The frontend is pinned to StudioNet chain `61999` in code:

```env
VITE_WEARLINE_CONTRACT_ADDRESS=0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06
```

The live site displays the canonical CA and loads the agreement lookup/create workflow. Vercel's remote production build passed typecheck and Vite build and published the stable `wearline.vercel.app` alias.

## Verified StudioNet lifecycle

The four-item agreement (`1`) was created, sealed, funded with exactly `1 GEN`, adjudicated, and settled. It produced `UNCHANGED` (0), `NEW_DAMAGE` severity 1 (`0.0625 GEN`), `NEW_DAMAGE` severity 3 (`0.25 GEN`), and `INCONCLUSIVE` (0). A pre-waiver settlement finalized with execution `ERROR`; the owner waiver finalized; settlement then finalized successfully. Its `0.3125 GEN` owner deduction plus `0.6875 GEN` renter refund equals the `1 GEN` frozen deposit. A duplicate settlement finalized with execution `ERROR` and did not change balances.

A second agreement (`2`) used a separate diffuse-fading evidence pair to verify `NORMAL_WEAR`, severity 0 and deduction 0. A third agreement (`3`) demonstrated all four classes together and settled a `0.25 GEN` deposit with `0.0625 GEN` to the owner and `0.1875 GEN` to the renter. All three agreements are settled; the contract balance is zero.

The classification of the first light-scuff example was `NEW_DAMAGE` severity 1. It is recorded as returned by consensus; it was not relabeled to fit the intended example. The second pair produced the live `NORMAL_WEAR` result.

Full transaction hashes, classifications, evidence digests, and balance checks are recorded in [SUBMISSION.md](SUBMISSION.md).
