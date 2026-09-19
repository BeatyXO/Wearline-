# Canonical deployment

Target network: **GenLayer StudioNet**  
Chain ID: **61999**

Canonical deployment has not been performed. The available CLI is configured for StudioNet (`61999`), but no deployment was attempted: the checkout has no Git metadata, outbound GitHub access is unavailable, and the active CLI account is an unrelated project account. Do not treat its presence as authorization to spend its funds.

After local verification, record all of the following in the same commit:

- deployed source commit SHA;
- SHA-256 of `contracts/Wearline.py`;
- canonical contract address;
- deployment transaction hash;
- explorer address URL;
- explorer transaction URL;
- direct-mode test result;
- StudioNet lifecycle proof transaction hashes;
- frontend deployment URL.

The frontend requires `VITE_WEARLINE_CONTRACT_ADDRESS` set to the verified canonical StudioNet address. Do not fill deployment fields with placeholders or unverified values. Current verification details and limitations are in [SUBMISSION.md](SUBMISSION.md).

Do not label a deployment canonical unless the explorer source matches the pinned repository commit.
