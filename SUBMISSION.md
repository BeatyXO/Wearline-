# Wearline — reviewer submission

## Purpose

Wearline settles a rental security deposit against SHA-256-bound before-and-after item evidence. GenLayer consensus is used because comparing photographs under a written wear policy requires judgment that a conventional deterministic contract cannot perform. The contract keeps that judgment separate from every monetary decision.

## What consensus may decide

For one registered item and its two frozen images, the leader and validators independently determine:

- `UNCHANGED`
- `NORMAL_WEAR`
- `NEW_DAMAGE`
- `INCONCLUSIVE`

Severity is `0` for the first, second, and fourth classes, and `1`, `2`, or `3` only for `NEW_DAMAGE`. Validators fetch and hash the same evidence and rerun the consequential assessment; acceptance requires their independently reproduced classification and severity to match the leader. Rationale is informational and has no financial authority.

Consensus cannot set prices, item caps, deductions, percentages, recipients, deposits, or payouts. No model-returned field supplies a monetary amount.

## State machine and evidence binding

`DRAFT → SEALED → FUNDED → REVIEWING → READY_TO_SETTLE → SETTLED`

The owner fixes the renter, deposit, policy, item list, baseline HTTPS URLs, SHA-256 digests, and caps before sealing. The renter must fund exactly the frozen deposit and submit checkout HTTPS URLs and digests. During adjudication, the contract rejects non-2xx responses, unsupported image content types, and either digest mismatch before vision analysis. Only the two hash-verified image byte arrays enter the vision assessment. Items and caps cannot change after sealing.

## Deterministic settlement

For each `NEW_DAMAGE` result, the deduction is calculated from that item's frozen cap:

| Result | Deduction |
| --- | ---: |
| `UNCHANGED` | 0 |
| `NORMAL_WEAR` | 0 |
| `INCONCLUSIVE` | 0; settlement blocked until owner waiver |
| `NEW_DAMAGE`, severity 1 | 25% |
| `NEW_DAMAGE`, severity 2 | 60% |
| `NEW_DAMAGE`, severity 3 | 100% |

The sum of caps must not exceed the deposit. Settlement requires all items to be adjudicated and every inconclusive item waived. It marks the agreement settled before emitting transfers, and cannot succeed twice. Final owner deductions plus renter refund equal the original deposit.

## Adversarial protections and tests

Direct Mode runs against the GenLayer contract runtime without live transactions. `gltest tests/direct_mode_suite.py -q` passed **20 tests**, including authorization and funding rules, post-seal immutability, all four classifications, exact 25/60/100% arithmetic, fail-closed inconclusive behavior, independent validator reassessment, duplicate adjudication/settlement protections, payout arithmetic, and evidence mismatch, inaccessible response, redirects/non-success status, unsupported MIME, identical images, and visible prompt injection.

`genvm-lint check contracts/Wearline.py` passed (3 checks; 13 methods). Nine supplementary source-invariant tests passed. GitHub Actions passed source checks and the frontend production typecheck/build; the latest verified run is linked from the repository's Actions page.

## Canonical deployment and source parity

- Network: GenLayer StudioNet, chain ID `61999` (`0xf22f`)
- Canonical CA: [`0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06`](https://explorer-studio.genlayer.com/address/0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06)
- Deployment transaction: [`0x26ff7e5b2db548ba830a576a4f8c634ac3e92f7267b3d3cd0628d01133de55d3`](https://explorer-studio.genlayer.com/tx/0x26ff7e5b2db548ba830a576a4f8c634ac3e92f7267b3d3cd0628d01133de55d3)
- Deployment status: `FINALIZED`, `MAJORITY_AGREE`, successful GenVM execution
- Deployed source commit: `e4ca067787d2e09d2f783464f846ada71901c03f`
- SHA-256 of `contracts/Wearline.py`: `1632CE639645656CCA7F331679ADAF6CBF48300980E4988D8DB593148FA659B2`
- Retrieved StudioNet source matched the pinned contract file byte-for-byte after newline normalization and produced the same SHA-256.

## StudioNet lifecycle proof

The lifecycle used three owner/renter agreements on the one canonical CA. Evidence URLs are immutable GitHub raw URLs pinned to evidence commits; recorded digests are the hashes stored on-chain.

### Agreement 1: four-item lifecycle

Agreement `1` deposited exactly `1 GEN`, with four `0.25 GEN` caps:

| Item | Consensus result | Severity | Deduction |
| --- | --- | ---: | ---: |
| Laptop cover, identical evidence | `UNCHANGED` | 0 | 0 GEN |
| Wood table, light line added | `NEW_DAMAGE` | 1 | 0.0625 GEN |
| Monitor with prominent screen cracks | `NEW_DAMAGE` | 3 | 0.25 GEN |
| Heavily blurred chair checkout | `INCONCLUSIVE` | 0 | 0 GEN |

The table result is the actual consensus outcome. The example was intended as light wear, but consensus identified a new line absent from baseline; it was not rewritten as `NORMAL_WEAR`. The separately tested upholstery example in agreement `2` supplies the verified normal-wear case.

The inconclusive item blocked settlement: [blocked settlement tx](https://explorer-studio.genlayer.com/tx/0x32b00171c0e060b6238ac9c02e08d6991325d20f5867bdcb14e1ea0b4f921cd8) finalized with `ERROR`. Owner waiver [`0x5320efe4144df3a0004e977aa4d3e742ad4d74e837eb9c34d599ea967dcc3c44`](https://explorer-studio.genlayer.com/tx/0x5320efe4144df3a0004e977aa4d3e742ad4d74e837eb9c34d599ea967dcc3c44) succeeded. Settlement [`0x8e0b7e760b8af456ac981e58f8718550eecf7d4565068c39c9ce3ba7ea6ddde9`](https://explorer-studio.genlayer.com/tx/0x8e0b7e760b8af456ac981e58f8718550eecf7d4565068c39c9ce3ba7ea6ddde9) finalized with successful execution. Its transfers finalized:

- Owner deduction: `0.3125 GEN`, transfer [`0xffe35bd5921601505849c433cfc468b0aa1d709534638e472d07d6c2418c0c6c`](https://explorer-studio.genlayer.com/tx/0xffe35bd5921601505849c433cfc468b0aa1d709534638e472d07d6c2418c0c6c).
- Renter refund: `0.6875 GEN`, transfer [`0xc7a611c921cdd70dbdc1195bfed594c004e542fd6e881feb05b1efbb58c4c116`](https://explorer-studio.genlayer.com/tx/0xc7a611c921cdd70dbdc1195bfed594c004e542fd6e881feb05b1efbb58c4c116).

The values sum to the frozen `1 GEN`. A second settlement attempt [`0xa6de2608bdbd0322482fd5cd783714a30f4b66dc10d1f0766d8776f9a87d72f9`](https://explorer-studio.genlayer.com/tx/0xa6de2608bdbd0322482fd5cd783714a30f4b66dc10d1f0766d8776f9a87d72f9) finalized with `ERROR`; owner and renter balances were unchanged. After agreement `1`, verified balances were owner `45.3125 GEN`, renter `4.6875 GEN`, contract `0 GEN`.

### Agreement 2: normal-wear lifecycle

Agreement `2` used commit-pinned diffuse upholstery fading images. StudioNet classified the item as `NORMAL_WEAR`, severity 0, deduction 0. Its `0.25 GEN` deposit was funded exactly and fully refunded to the renter:

- Adjudication: [`0x8cefc17293c949dfb6ff648a5e383798fe3b998fcd54a40269165779142cdbd1`](https://explorer-studio.genlayer.com/tx/0x8cefc17293c949dfb6ff648a5e383798fe3b998fcd54a40269165779142cdbd1), finalized with successful execution.
- Settlement: [`0x6fed41ff83bf584eedcacf28dd284c47ce3fdea7a85bcc0902bca0600a4544ac`](https://explorer-studio.genlayer.com/tx/0x6fed41ff83bf584eedcacf28dd284c47ce3fdea7a85bcc0902bca0600a4544ac), finalized with successful execution.
- Renter refund: `0.25 GEN`, transfer [`0x522f0b722cfd09fdd2665f3d292570e56557e50eae8a20fc5217d5245b1f5a3d`](https://explorer-studio.genlayer.com/tx/0x522f0b722cfd09fdd2665f3d292570e56557e50eae8a20fc5217d5245b1f5a3d), EVM receipt status `0x1`.

Agreement `2` ended `SETTLED`; `0 GEN` went to the owner and `0.25 GEN` returned to the renter. Final contract balance remained `0 GEN`.

### Agreement 3: four-class proof in one lifecycle

Agreement `3` used four registered items, each with a `0.0625 GEN` cap, and the renter funded the exact `0.25 GEN` deposit. All four requested classes were produced together by finalized StudioNet adjudications:

| Item | Consensus result | Severity | Deduction |
| --- | --- | ---: | ---: |
| Identical laptop-cover images | `UNCHANGED` | 0 | 0 GEN |
| Diffuse upholstery fading | `NORMAL_WEAR` | 0 | 0 GEN |
| Cracked display | `NEW_DAMAGE` | 3 | `0.0625 GEN` (100% of cap) |
| Blurred chair checkout | `INCONCLUSIVE` | 0 | 0 GEN |

The pre-waiver settlement transaction [`0x2157455e773b8d2da0c215ba0b271af2764596e019b2184291a8217837481c53`](https://explorer-studio.genlayer.com/tx/0x2157455e773b8d2da0c215ba0b271af2764596e019b2184291a8217837481c53) finalized with execution `ERROR`, confirming the fail-closed block. Owner waiver [`0xcd14410f48d367a95c15f49a506487a83b0120ea472f5b44ca5b21cf80d1dc9e`](https://explorer-studio.genlayer.com/tx/0xcd14410f48d367a95c15f49a506487a83b0120ea472f5b44ca5b21cf80d1dc9e) finalized successfully. Settlement [`0x7cf6f9c4a52c2a0ea22e1a374ef743790d0173957912ba753d85262a923ea4b1`](https://explorer-studio.genlayer.com/tx/0x7cf6f9c4a52c2a0ea22e1a374ef743790d0173957912ba753d85262a923ea4b1) finalized with successful execution and set the agreement to `SETTLED`.

The settlement emitted two finalized EVM transfers with successful receipt status `0x1`: `0.0625 GEN` to the owner ([transfer](https://explorer-studio.genlayer.com/tx/0x0ba07835332706717f9809a8faccd768dd4d4e90c23f30226467eeafbc664b28)) and `0.1875 GEN` to the renter ([refund](https://explorer-studio.genlayer.com/tx/0x8b78495bc7a9fae3fafb71814ba86bf22e3536ef54ba89a12f513d5afebd2cf9)). The values sum to the `0.25 GEN` frozen deposit. The contract balance is `0 GEN`; observed owner and renter balances after this lifecycle were `45.375 GEN` and `4.625 GEN` respectively.

### Transaction ledger

All listed calls were inspected in the [canonical contract transaction list](https://explorer-studio.genlayer.com/address/0xBB03057Ff1496E7f53a73F88100D855Ed2b7ca06). Except where marked `ERROR`, calls finalized with successful execution.

| Agreement | Operation | Transaction hash |
| --- | --- | --- |
| Funding | Transfer 5 GEN to renter test wallet | `0x1365af5920f1ead1f171704417ff0d1fc1d285e49655f3b7c1279bf9e3499599` |
| 1 | Create | `0x52da63198818aac39f1caf6d44e102f51a38ebcfffbbe4615d92243cb76da6b8` |
| 1 | Add item 0–3 | `0x41f1e36ea09e2e2bcc283a831b4b4231072750ebee08d9947c6b4181a309898d`, `0x119df8306599dca869f05ce15bc624fbf645a7de461912a41377395aef6fe509`, `0xdf9fd8cc3cb820de386a4f9b02f60c32e980b0249c92150db15e7429fa1d1d82`, `0xa4f84a0cfd4b4283b3745237d4286757fd2dc4e3718d2fec73964f2a5f563d63` |
| 1 | Seal | `0x5cc2650db90acdb83e3f8b734e9812c1f07d88779b0a16e57256a7fc1398ffd8` |
| 1 | Exact 1 GEN funding | `0x6d30269f5973102247b10e1a7a6cfb001f4626f83c29783530013e4df2296a33` |
| 1 | Checkout evidence 0–3 | `0xd165810d1dfdf59dd040c8b66e49f3a5d094c8d0ff1759419c91f4e2fda0a094`, `0x7b10b178d17cf13a95a11a93149290444792df5f48afb1dc2a44efd4f1c22b6b`, `0xde2556f86770e9386d60749989e3b602050bae4aabc56092fcd862f12adf62a5`, `0xd93148bb6fbb59f133a0856a42258e77fc2233705b25399a940c2c362735fd0e` |
| 1 | Adjudicate 0–3 | `0x1ec9d45a4a1673b07ca13eb52ba1a66f137fa4a49b16177c4bc56bad4a2e2a0a`, `0x5c7682d51fcf48242aa144a587ac5f2d7e1ccd46298196577fad8854f4de059e`, `0x6c6fc66326245f64546b934c283f486022aa58f465563375b0ec0d3d4216fedd`, `0x4b91870ad05dcfc7b5937031b118e07c4269ed9e5bc4ed2d5537c18f12bd4aeb` |
| 1 | Settlement blocked before waiver (`ERROR`) | `0x32b00171c0e060b6238ac9c02e08d6991325d20f5867bdcb14e1ea0b4f921cd8` |
| 1 | Owner inconclusive waiver | `0x5320efe4144df3a0004e977aa4d3e742ad4d74e837eb9c34d599ea967dcc3c44` |
| 1 | Settle | `0x8e0b7e760b8af456ac981e58f8718550eecf7d4565068c39c9ce3ba7ea6ddde9` |
| 1 | Owner and renter payout sends | `0xffe35bd5921601505849c433cfc468b0aa1d709534638e472d07d6c2418c0c6c`, `0xc7a611c921cdd70dbdc1195bfed594c004e542fd6e881feb05b1efbb58c4c116` |
| 1 | Duplicate settlement rejected (`ERROR`) | `0xa6de2608bdbd0322482fd5cd783714a30f4b66dc10d1f0766d8776f9a87d72f9` |
| 2 | Create | `0x8d064a90667111dacd626fd51f26978eca82aa6eac06d27cde650593a427194c` |
| 2 | Add item | `0x92ce8e0f26082053f48c20d6e9539ece10625d9044c50e630f5dfd97fb6cd80a` |
| 2 | Seal | `0x07279ffca11b673ef6775e20c590cc298fb1c4851991aae7120e7eb1fb95c687` |
| 2 | Exact 0.25 GEN funding | `0x2a7c40d4031dc3fc57640a69bbf81af6842ec5fb02e38e5129add44bcdc9a699` |
| 2 | Checkout evidence | `0x67d8dd7d4e33ca0eaec776c2bdc8a65387d5f7e3df9e8ff14a518c33160e05d5` |
| 2 | Adjudicate normal-wear item | `0x8cefc17293c949dfb6ff648a5e383798fe3b998fcd54a40269165779142cdbd1` |
| 2 | Settle | `0x6fed41ff83bf584eedcacf28dd284c47ce3fdea7a85bcc0902bca0600a4544ac` |
| 2 | Renter refund send | `0x522f0b722cfd09fdd2665f3d292570e56557e50eae8a20fc5217d5245b1f5a3d` |
| 3 | Create | `0x9896285456cc65a9cad0e710fb3997d71380d39c8ffa0db62e4626f7e5438fa7` |
| 3 | Add items 0–3 | `0xac2edf0d0b96dd48fd0f4432a9b1b85d1208f0442f4d0629fac43ec33ffe89c8`, `0xc8b6325e66e21d9b3c0f3744fc96c34689ad91c6a9ab1c999a25e22cf3584059`, `0x1a48682061c557390e0b099c3f8084b4f9a83f1c17884a5e4b721140c8c1ce2e`, `0xc64f279e9e0baef81c46f0035b860820c8d48bf55e13304cf24409ea2983325a` |
| 3 | Seal | `0xa6299e284b69c826207dc6973cc85cfb67aff4024ec7f6dc96efa5e03b1aa6db` |
| 3 | Exact 0.25 GEN funding | `0x5c73588f0d054414188d0999dd3c5be73695699dc93849543b880098dc4f81f9` |
| 3 | Checkout evidence 0–3 | `0xd2bfcbf8f0fbc1860467ee044a7c2c239b21ff0977a0d93ae441ed8bc1d15c2c`, `0xfb85c49f8568d2dc26a52f0f2609f71e1af5715d3c58a476ba59f1c6f5752e14`, `0xb967dc85a7d2866b1fadf1ca613a63fe981f85e9adc1f359283433d6c3e9ca6f`, `0x055484d28d581ca5167d34ff3e0a8dbd76c25330476fb84d221da19886f57623` |
| 3 | Adjudicate 0–3 | `0x47d741b2879d062d32e98e485122b836566f111cb91e3c3e4cbdf957110c2000`, `0x12d2ca17acb6467616559c06ba2470e7bfa8714e0006eaf60f8665cd6f771807`, `0x17931eeffab6bc98be1d82c9536739f526c37f0ba7dfbf17464c99efef215d8c`, `0xb09b9542a1bde2c59d55b980e54a2c7081711e1356ffc97576b7a32e62576cdc` |
| 3 | Settlement blocked before waiver (`ERROR`) | `0x2157455e773b8d2da0c215ba0b271af2764596e019b2184291a8217837481c53` |
| 3 | Owner inconclusive waiver | `0xcd14410f48d367a95c15f49a506487a83b0120ea472f5b44ca5b21cf80d1dc9e` |
| 3 | Settle | `0x7cf6f9c4a52c2a0ea22e1a374ef743790d0173957912ba753d85262a923ea4b1` |
| 3 | Owner deduction / renter refund | `0x0ba07835332706717f9809a8faccd768dd4d4e90c23f30226467eeafbc664b28`, `0x8b78495bc7a9fae3fafb71814ba86bf22e3536ef54ba89a12f513d5afebd2cf9` |

## Evidence digests stored on-chain

The first eight image URLs are pinned to evidence commit `d080e6cc39cb782eddaa9e32a4cd108b04e5878f`; the diffuse normal-wear pair is pinned to `d5d59b957986fd85b392ae9fa19eb33d214a3253`.

| Evidence image | SHA-256 |
| --- | --- |
| Agreement 1 unchanged baseline and checkout | `9ba685e3335d2590c72ac160eb23d80123e53fd1dde2a364b2df3e7311754bf8` |
| Agreement 1 light-scuff baseline | `9ba685e3335d2590c72ac160eb23d80123e53fd1dde2a364b2df3e7311754bf8` |
| Agreement 1 light-scuff checkout | `a1604128984a7823230ca78cce3d41cf4a8fec8f1d94daaaf74552760cd31585` |
| Agreement 1 cracked-screen baseline | `de835d4f8110ddcb69ab7271006b7079f5404afac45941b66b3e2eeb9dcab0fc` |
| Agreement 1 cracked-screen checkout | `ff850f14fb540475c4d1bc82b0ed254907a712a8f12a184be6079f642bebbd54` |
| Agreement 1 inconclusive baseline | `9ba685e3335d2590c72ac160eb23d80123e53fd1dde2a364b2df3e7311754bf8` |
| Agreement 1 inconclusive checkout | `8765d6df997fbef68e22aa76034803f174d2674a37aa046fecddfc0dd2ae375d` |
| Agreement 2 normal-wear baseline | `1432c4c18a88fc12aa3fdc0dd2e5a1817bc75f2387d8057e51d69e749c21f4a1` |
| Agreement 2 normal-wear checkout | `882567f7ebd8175dcb96e384cfc2f0f0191d7dc32a8f21b20debd1644941235b` |

## Release status

The live contract deployment and three StudioNet lifecycles are verified, including all four classifications together in agreement `3`. The frontend reads live agreement and item state and supports the complete creation, evidence, exact funding, adjudication, waiver, and settlement workflow. Local typecheck and production build pass. Vercel deployment remains unverified because this environment could not reach Vercel; no frontend URL is claimed. The required Vercel build settings and `VITE_WEARLINE_CONTRACT_ADDRESS` are recorded in [DEPLOYMENT.md](DEPLOYMENT.md).
