# Wearline pre-deployment handoff

Wearline is now scoped to physical remediation requirement verification. The working contract, frontend, test suite, evidence fixtures and documentation use the same case/item model and StudioNet `61999` configuration.

The repository must remain stopped before live deployment until explicit authorization is given.

Pending live-only work:

- deploy the fresh contract from the final pushed source commit;
- record address, transaction and source hash;
- configure the frontend with that fresh address;
- execute and record the live remediation lifecycle;
- publish the freshly wired frontend.

Do not substitute any earlier Wearline address for the pending fresh deployment.
