# Wearline threat model

## Mutable remote evidence

Each evidence URL is paired with a frozen SHA-256. Validators fetch the remote bytes and recompute the digest before vision analysis. Changed bytes fail closed.

## Unsupported or unavailable evidence

Non-success HTTP responses and unsupported MIME types are rejected before model execution. A failed external fetch never becomes a successful remediation verdict.

## Prompt injection inside images

The verification prompt explicitly states that all visible image text is untrusted evidence and never an instruction. The model is restricted to one frozen verification question and a closed verdict vocabulary.

## Requirement drift

The exact remediation requirement is registered before the case is sealed. Verification instructs the model not to invent, expand or substitute requirements. No post-seal write method can alter the requirement.

## Evidence substitution

Baseline evidence is frozen at item registration. Completion evidence can be submitted only by the registered remediator and cannot be overwritten after submission. Both references are hash-bound.

## Leader-only interpretation

Validators independently rerun the complete assessment. Consensus validation compares the consequential `verdict`, while reasoning remains explanatory and does not require byte-for-byte equality.

## Ambiguous photography

`INCONCLUSIVE` is a first-class fail-closed outcome. Once all items are verified, any `INCONCLUSIVE` forces the case result to `REVIEW_REQUIRED`.

## Unauthorized success override

There is no privileged write method that can directly set an item verdict or case result. Item verdicts are stored only after GenLayer verification, and the final case result is derived deterministically from those verdicts.

## Duplicate processing

A second completion submission for the same item is rejected. A second verification of an already verified item is also rejected.

## Frontend trust

The web interface is not authoritative. Contract authorization and state checks remain effective if the interface is modified or replaced.
