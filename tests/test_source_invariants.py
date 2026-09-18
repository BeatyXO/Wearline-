import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTRACT = (ROOT / "contracts" / "Wearline.py").read_text(encoding="utf-8")
FRONTEND = (ROOT / "frontend" / "src" / "lib" / "genlayer.ts").read_text(encoding="utf-8")


class SourceInvariantTests(unittest.TestCase):
    def test_single_contract_file(self):
        contracts = list((ROOT / "contracts").glob("*.py"))
        self.assertEqual([path.name for path in contracts], ["Wearline.py"])

    def test_genvm_dependency_is_pinned(self):
        self.assertTrue(CONTRACT.startswith('# { "Depends": "py-genlayer:'))

    def test_runtime_code_does_not_target_other_genlayer_networks(self):
        runtime_files = [
            ROOT / "contracts" / "Wearline.py",
            ROOT / "frontend" / "src" / "lib" / "genlayer.ts",
            ROOT / "frontend" / "src" / "App.tsx",
            ROOT / ".env.example",
        ]
        runtime_text = "\n".join(
            p.read_text(encoding="utf-8", errors="ignore") for p in runtime_files
        ).lower()
        self.assertNotIn("testnetbradbury", runtime_text)
        self.assertNotIn("61997", runtime_text)

    def test_frontend_targets_studionet(self):
        self.assertIn("studionet", FRONTEND)

    def test_consensus_is_independently_reproduced(self):
        self.assertIn("validator_data = assess()", CONTRACT)
        self.assertIn('leader_data["classification"] == validator_data["classification"]', CONTRACT)
        self.assertIn('int(leader_data["severity"]) == int(validator_data["severity"])', CONTRACT)

    def test_two_image_vision_pair(self):
        self.assertRegex(CONTRACT, re.compile(r"images=\[baseline_bytes, checkout_bytes\]"))

    def test_evidence_hashes_are_verified_before_vision(self):
        hash_pos = CONTRACT.index("hashlib.sha256(baseline_bytes)")
        llm_pos = CONTRACT.index("gl.nondet.exec_prompt")
        self.assertLess(hash_pos, llm_pos)
        self.assertIn("baseline evidence hash mismatch", CONTRACT)
        self.assertIn("checkout evidence hash mismatch", CONTRACT)

    def test_payout_is_derived_not_model_supplied(self):
        self.assertIn("deduction = self._deduction_for", CONTRACT)
        self.assertNotIn('result["deduction"]', CONTRACT)
        self.assertNotIn('result.get("deduction"', CONTRACT)

    def test_inconclusive_fails_closed(self):
        self.assertIn('classification == self.CLASS_INCONCLUSIVE and not item.waived', CONTRACT)
        self.assertIn("unwaived inconclusive item blocks settlement", CONTRACT)


if __name__ == "__main__":
    unittest.main()
