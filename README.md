# Wearline

**Physical remediation requirement verification on GenLayer StudioNet (chain ID `61999`).**

Wearline verifies whether physical repair or remediation work satisfies a requirement that was frozen before the work was completed. It is one Intelligent Contract plus a React/Vite reviewer interface.

## Why GenLayer is required

Deterministic contract logic can freeze participants, workflow state, evidence URLs, SHA-256 digests, defect descriptions and exact remediation requirements. It cannot reliably interpret physical visual evidence and decide whether a natural-language completion requirement is actually satisfied.

Wearline puts only that bounded visual judgment through GenLayer. The leader and validators independently fetch the same baseline and completion images, verify their frozen hashes before vision analysis, and assess the same requirement. The only consequential model field compared during validation is `verdict`; prose reasoning is retained for review but does not control state derivation.

## Verdict model

| Verdict | Meaning |
| --- | --- |
| `SATISFIED` | Completion evidence reliably demonstrates the frozen requirement is satisfied. |
| `PARTIALLY_SATISFIED` | Meaningful remediation is visible, but a material part of the requirement remains unsatisfied. |
| `NOT_SATISFIED` | The frozen requirement has not been materially satisfied. |
| `INCONCLUSIVE` | The visual evidence cannot support a reliable determination. |

`INCONCLUSIVE` always fails closed. It can never produce `ACCEPTED`.

## Case model

Each case stores:

- `requester` and `remediator`;
- a case title/reference;
- `DRAFT → SEALED → REVIEWING → VERIFIED` state;
- registered item and verified-item counts;
- a derived case result.

Each item freezes:

- label and defect description;
- baseline HTTPS URL and SHA-256;
- exact remediation requirement;
- later completion HTTPS URL and SHA-256;
- final verdict and validator reasoning.

Case result is derived after every item is verified:

- all items `SATISFIED` → `ACCEPTED`;
- any `PARTIALLY_SATISFIED` or `NOT_SATISFIED` → `REMEDIATION_REQUIRED`;
- any `INCONCLUSIVE` → `REVIEW_REQUIRED`.

## Public contract surface

Write methods:

- `create_case(remediator, title)`
- `add_item(case_id, label, defect_description, baseline_url, baseline_sha256, remediation_requirement)`
- `seal_case(case_id)`
- `submit_completion(case_id, item_index, completion_url, completion_sha256)`
- `verify_item(case_id, item_index)`

View methods:

- `get_case(case_id)`
- `get_item(case_id, item_index)`
- `get_item_count(case_id)`
- `get_next_case_id()`

There are no value-bearing write methods and no transfer-emission interface.

## Evidence and consensus safety

- HTTPS evidence only.
- JPEG, PNG and WebP only.
- Both images are fetched inside nondeterministic execution.
- Both SHA-256 digests are checked before vision analysis.
- Text visible inside evidence is explicitly treated as untrusted data, never instructions.
- The model response must contain exactly `verdict` and `reasoning`.
- The verdict is restricted to the four-value closed enum above.
- Validators independently rerun the assessment and compare only the verdict.
- Duplicate completion submission and duplicate item verification are rejected.
- There is no privileged method that can force an item to `SATISFIED`.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## Frontend

The web app preserves the existing Wearline visual identity and StudioNet wallet/finality flow while exposing only the new case model:

- Home overview;
- case creation, item registration and sealing;
- side-by-side **BEFORE REMEDIATION** and **COMPLETION EVIDENCE**;
- completion submission by the registered remediator;
- GenLayer item verification;
- derived verification report.

Local development:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

The contract address is intentionally blank before the fresh deployment:

```env
VITE_WEARLINE_CONTRACT_ADDRESS=
```

Do not insert a historical Wearline address into active configuration.

## Quality checks

```bash
python -m pip install -r requirements-test.txt
genvm-lint check contracts/Wearline.py
gltest tests/direct_mode_suite.py -q
python -m unittest tests/test_source_invariants.py -v
python scripts/check_stale_terms.py
cd frontend && npm ci && npm run typecheck && npm run build
```

The CI workflow runs the same contract, source, terminology and frontend checks.

## Network and deployment status

- Network: GenLayer StudioNet
- Chain ID: `61999` (`0xf22f`)
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Fresh contract address: **PENDING DEPLOYMENT**
- Fresh deployment transaction: **PENDING DEPLOYMENT**
- Live remediation lifecycle: **PENDING DEPLOYMENT**

The repository is designed to stop at the pre-deployment boundary until a fresh StudioNet deployment is explicitly authorized.
