# Canonical deployment

Target network: **GenLayer StudioNet**  
Chain ID: **61999**

Canonical deployment has not been performed. The current checkout is connected to GitHub `main`, the StudioNet CLI reports chain ID `61999`, and dedicated owner and renter wallets have been created. The CLI's fee-estimation command currently fails because its installed SDK does not expose the method it calls. No funds have been transferred and no deployment transaction has been submitted yet.

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
