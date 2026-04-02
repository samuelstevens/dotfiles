"""Apply GNU Stow packages from this repo with one command."""

import argparse
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
EXCLUDED_DIRS = {".git", "agentskills.io", "docs"}


def is_stow_package(path: Path) -> bool:
    if not path.is_dir() or path.name in EXCLUDED_DIRS or path.name.startswith("."):
        return False

    for child in path.rglob("*"):
        if child.name.startswith("."):
            return True

    return False


def discover_packages() -> list[str]:
    return sorted(path.name for path in REPO_ROOT.iterdir() if is_stow_package(path))


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Restow all top-level dotfile packages into a target directory.",
    )
    parser.add_argument(
        "packages",
        nargs="*",
        help="Specific packages to stow. Defaults to all detected packages.",
    )
    parser.add_argument(
        "--target",
        default=os.path.expanduser("~"),
        help="Stow target directory. Defaults to $HOME.",
    )
    parser.add_argument(
        "--stow-bin", default="stow", help="Path to the stow executable."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show the stow commands without making changes.",
    )
    parser.add_argument(
        "--list", action="store_true", help="Print detected packages and exit."
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    detected_packages = discover_packages()

    if args.list:
        for package in detected_packages:
            print(package)
        return 0

    packages = args.packages or detected_packages
    missing = sorted(set(packages) - set(detected_packages))
    if missing:
        print(f"Unknown package(s): {', '.join(missing)}", file=sys.stderr)
        print(
            "Run `uv run stow-all.py --list` to see the detected packages.",
            file=sys.stderr,
        )
        return 2

    if not packages:
        print("No stow packages found.", file=sys.stderr)
        return 1

    target = Path(args.target).expanduser().resolve()
    stow_args = [args.stow_bin, "--target", str(target), "--restow"]
    if args.dry_run:
        stow_args.append("--simulate")

    for package in packages:
        cmd = [*stow_args, package]
        print("+", " ".join(cmd), flush=True)
        result = subprocess.run(cmd, cwd=REPO_ROOT, check=False)
        if result.returncode != 0:
            print(f"`stow` failed for package `{package}`.", file=sys.stderr)
            print(
                f"Re-run with a narrower selection, for example `uv run stow-all.py {package}`.",
                file=sys.stderr,
            )
            return result.returncode

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
