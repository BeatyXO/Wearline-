from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TEXT_SUFFIXES = {".py", ".ts", ".tsx", ".md", ".json", ".html", ".yml", ".yaml", ".txt", ".example"}

WORDS = [
    "security" + " " + "depo" + "sit",
    "land" + "lord",
    "ten" + "ant",
    "rent" + "er",
    "rent" + "al",
    "depo" + "sit",
    "deduc" + "tion",
    "re" + "fund",
    "pay" + "out",
    "set" + "tle" + "ment",
    "move" + "-in",
    "move" + "-out",
    "check" + "out",
    "normal" + " " + "wear",
    "sever" + "ity",
    "agree" + "ment",
]
IDENTIFIERS = [
    "fund_" + "agre" + "ement",
    "emit_" + "transfer",
    "un" + "changed",
    "normal_" + "wear",
    "new_" + "damage",
    "set" + "tle",
]
PATH_FRAGMENTS = [
    "agre" + "ement",
    "set" + "tle" + "ment",
    "check" + "out",
    "normal-" + "wear",
    "new-" + "damage",
    "un" + "changed",
]

violations = []
inspected = 0
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if any(part in {".git", "node_modules", "dist", ".venv", "__pycache__"} for part in path.parts):
        continue
    if path.suffix.lower() not in TEXT_SUFFIXES and path.name != ".env.example":
        continue
    inspected += 1
    rel = path.relative_to(ROOT).as_posix()
    path_lower = rel.lower()
    for fragment in PATH_FRAGMENTS:
        if fragment in path_lower:
            violations.append((rel, f"path:{fragment}"))

    text = path.read_text(encoding="utf-8", errors="ignore").lower()
    # Third-party CI action identifier; not Wearline domain language.
    text = text.replace("actions/" + "check" + "out@v4", "actions/source-fetch@v4")
    for word in WORDS:
        if re.search(rf"(?<![a-z]){re.escape(word)}(?![a-z])", text):
            violations.append((rel, word))
    for identifier in IDENTIFIERS:
        if identifier in text:
            violations.append((rel, identifier))

if violations:
    for rel, term in violations:
        print(f"STALE: {rel}: {term}")
    sys.exit(1)

print(f"stale terminology check passed across {inspected} active repository text files")
