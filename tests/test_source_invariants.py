import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTRACT = (ROOT / "contracts" / "Wearline.py").read_text(encoding="utf-8")
FRONTEND_ROOT = ROOT / "frontend" / "src"
FRONTEND = "\n".join(
    path.read_text(encoding="utf-8", errors="ignore")
    for path in FRONTEND_ROOT.rglob("*")
    if path.is_file() and path.suffix in {".ts", ".tsx"}
)


class SourceInvariantTests(unittest.TestCase):
    def test_single_contract_file(self):
        contracts = list((ROOT / "contracts").glob("*.py"))
        self.assertEqual([path.name for path in contracts], ["Wearline.py"])

    def test_genvm_dependency_is_pinned(self):
        self.assertTrue(CONTRACT.startswith('# { "Depends": "py-genlayer:'))

    def test_runtime_targets_only_studionet_61999(self):
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
        self.assertIn("61999", runtime_text)
        self.assertIn("studionet", runtime_text)

    def test_consensus_is_independently_reproduced_and_verdict_only(self):
        self.assertIn("validator_data = assess()", CONTRACT)
        self.assertIn('leader_data["verdict"] == validator_data["verdict"]', CONTRACT)
        self.assertNotIn('leader_data["reasoning"]', CONTRACT)

    def test_two_image_verification_pair(self):
        self.assertRegex(CONTRACT, re.compile(r"images=\[baseline_bytes, completion_bytes\]"))

    def test_evidence_hashes_are_verified_before_vision(self):
        baseline_pos = CONTRACT.index("hashlib.sha256(baseline_bytes)")
        completion_pos = CONTRACT.index("hashlib.sha256(completion_bytes)")
        model_pos = CONTRACT.index("gl.nondet.exec_prompt")
        self.assertLess(baseline_pos, model_pos)
        self.assertLess(completion_pos, model_pos)
        self.assertIn("baseline evidence hash mismatch", CONTRACT)
        self.assertIn("completion evidence hash mismatch", CONTRACT)

    def test_closed_verdict_model(self):
        expected = {
            "SATISFIED",
            "PARTIALLY_SATISFIED",
            "NOT_SATISFIED",
            "INCONCLUSIVE",
        }
        constants = set(re.findall(r'VERDICT_[A-Z_]+ = "([A-Z_]+)"', CONTRACT))
        self.assertEqual(constants, expected)

    def test_public_write_surface_is_minimal(self):
        methods = set(re.findall(r"@gl\.public\.write\s+def\s+(\w+)", CONTRACT))
        self.assertEqual(methods, {"create_case", "add_item", "seal_case", "submit_completion", "verify_item"})
        self.assertNotIn("@gl.public.write.payable", CONTRACT)
        self.assertNotIn("emit_" + "transfer", CONTRACT)

    def test_frontend_uses_only_new_contract_calls(self):
        for method in ("create_case", "add_item", "seal_case", "submit_completion", "verify_item", "get_case", "get_item", "get_next_case_id"):
            self.assertIn(method, FRONTEND)

    def test_frontend_contract_address_is_pending(self):
        env_text = (ROOT / ".env.example").read_text(encoding="utf-8")
        self.assertEqual(env_text.strip(), "VITE_WEARLINE_CONTRACT_ADDRESS=")


if __name__ == "__main__":
    unittest.main()
