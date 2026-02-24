"""
test_confidence.py
------------------
Smoke-test for low-confidence / unknown-skills detection logic.
Run from repo root:  python test_confidence.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.ml.model import model
from backend.ml.logic import recommend
from backend.schemas import LOW_CONFIDENCE_THRESHOLD


def run_case(label: str, skills: str, top_n: int = 3) -> None:
    print(f"\n{'=' * 60}")
    print(f"Test : {label}")
    print(f"Input: '{skills}'")
    print(f"Threshold: {LOW_CONFIDENCE_THRESHOLD}%")
    print("-" * 60)

    df = recommend(skills, model, top_n=top_n)

    all_low = True
    for _, row in df.iterrows():
        score_pct = round(row["score"] * 100, 2)
        low = score_pct < LOW_CONFIDENCE_THRESHOLD
        flag = "WARN LOW" if low else "OK     "
        print(f"  [{flag}]  {row['role']:<35}  score={score_pct:>6.2f}%")
        if not low:
            all_low = False

    print()
    if all_low:
        print("  >> no_strong_match = True  (suggestion text would be shown)")
    else:
        print("  >> no_strong_match = False (normal results)")


if __name__ == "__main__":
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "backend", "data", "job_roles.csv")
    model.load(csv_path)

    run_case("Known skills -- Python / Data",
             "python sql pandas machine learning scikit-learn")
    run_case("Game Dev skills",
             "unity unreal engine c# game physics shaders")
    run_case("Blockchain skills",
             "solidity ethereum web3 smart contracts")
    run_case("Completely unknown -- nonsense",
             "origami pottery clay sculpting medieval jousting")

    print(f"\n{'=' * 60}")
    print("Done.")
