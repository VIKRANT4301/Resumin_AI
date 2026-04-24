#!/usr/bin/env python3
"""
Quick validation test - No embeddings required
Tests all core fixes without loading AI models
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Backend'))

from services.matcher_service import (
    _canonicalize_skill,
    _estimate_experience_years,
    _display_skill,
)

# Color codes
GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'

def test_canonicalization():
    """Test Fix #1: Skill aliases"""
    print(f"\n{BLUE}=== FIX #1: SKILL CANONICALIZATION ==={RESET}")
    
    tests = [
        ("Vue 3", "vue", "✓ Modern Vue 3"),
        ("Next.js", "next.js", "✓ Next.js"),
        ("Nuxt 3", "nuxt", "✓ Nuxt 3"),
        ("SvelteKit", "svelte", "✓ SvelteKit"),
        ("Postgres", "postgresql", "✓ Postgres alias"),
        ("DynamoDB", "dynamodb", "✓ DynamoDB"),
        ("ML", "machine learning", "✓ ML abbreviation"),
        ("AI", "ai", "✓ AI abbreviation"),
        ("React.js", "react", "✓ React.js"),
        ("Node.js", "node.js", "✓ Node.js"),
    ]
    
    passed = 0
    for input_val, expected, desc in tests:
        result = _canonicalize_skill(input_val)
        if result == expected:
            print(f"  {GREEN}✓{RESET} {desc}")
            passed += 1
        else:
            print(f"  {RED}✗{RESET} {desc} - got '{result}'")
    
    print(f"  Result: {passed}/{len(tests)} PASSED")
    return passed == len(tests)


def test_experience():
    """Test Fix #2: Experience calculation"""
    print(f"\n{BLUE}=== FIX #2: EXPERIENCE YEAR CALCULATION ==={RESET}")
    
    tests = [
        ({"experience": [{"period": "2020-2022"}]}, 2, "✓ Date range extraction"),
        ({"experience": [{"period": "2018-2020"}, {"period": "2021-2023"}]}, 5, "✓ Multiple date ranges"),
        ({"experience": [{"title": "Job 1"}, {"title": "Job 2"}, {"title": "Job 3"}]}, 6, "✓ Fallback heuristic (2 years/job)"),
        ({"experience": []}, 0, "✓ No experience"),
    ]
    
    passed = 0
    for resume, expected, desc in tests:
        result = _estimate_experience_years(resume)
        # Allow ±1 year tolerance for heuristic fallback
        success = result == expected or abs(result - expected) <= 1
        if success:
            print(f"  {GREEN}✓{RESET} {desc} - {result} years")
            passed += 1
        else:
            print(f"  {RED}✗{RESET} {desc} - got {result}, expected {expected}")
    
    print(f"  Result: {passed}/{len(tests)} PASSED")
    return passed == len(tests)


def test_display_skill():
    """Test Fix #1 extended: Display skill formatting"""
    print(f"\n{BLUE}=== FIX #1 EXTENDED: SKILL DISPLAY ==={RESET}")
    
    tests = [
        ("react", "React", "✓ React capitalization"),
        ("node.js", "Node.js", "✓ Node.js formatting"),
        ("javascript", "JavaScript", "✓ JavaScript capitalization"),
        ("postgresql", "PostgreSQL", "✓ PostgreSQL capitalization"),
    ]
    
    passed = 0
    for input_val, expected, desc in tests:
        result = _display_skill(input_val)
        if result == expected:
            print(f"  {GREEN}✓{RESET} {desc}")
            passed += 1
        else:
            print(f"  {RED}✗{RESET} {desc} - got '{result}'")
    
    print(f"  Result: {passed}/{len(tests)} PASSED")
    return passed == len(tests)


def main():
    print(f"\n{BLUE}{'='*60}")
    print(f"  RECRUITER PORTAL ACCURACY FIXES VALIDATION")
    print(f"  Quick Test Suite (No Embeddings Required)")
    print(f"{'='*60}{RESET}\n")
    
    results = {
        "Skill Canonicalization": test_canonicalization(),
        "Experience Calculation": test_experience(),
        "Skill Display Formatting": test_display_skill(),
    }
    
    print(f"\n{BLUE}{'='*60}")
    print(f"  SUMMARY")
    print(f"{'='*60}{RESET}\n")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, success in results.items():
        status = f"{GREEN}✓{RESET}" if success else f"{RED}✗{RESET}"
        print(f"  {status} {name}")
    
    print(f"\n  {passed}/{total} test categories PASSED\n")
    
    if passed == total:
        print(f"{GREEN}{'='*60}")
        print(f"  ✓ ALL CORE FIXES VALIDATED SUCCESSFULLY!")
        print(f"  ✓ ACCURACY IMPROVEMENTS IMPLEMENTED!")
        print(f"{'='*60}{RESET}\n")
        return 0
    else:
        print(f"{RED}{'='*60}")
        print(f"  ⚠ Some tests failed")
        print(f"{'='*60}{RESET}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
