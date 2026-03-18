import os
import pathlib
import re
import shutil
import subprocess
import time

pkg = "casey/just"

asset = {
    "linux-x86_64": "just-*-x86_64-unknown-linux-musl.tar.gz",
    "linux-arm64": "just-*-aarch64-unknown-linux-musl.tar.gz",
    "darwin-x86_64": "just-*-x86_64-apple-darwin.tar.gz",
    "darwin-arm64": "just-*-aarch64-apple-darwin.tar.gz",
}

binary = {
    "linux-x86_64": "just",
    "linux-arm64": "just",
    "darwin-x86_64": "just",
    "darwin-arm64": "just",
}


def ghrel_post_install(
    *,
    version: str,
    bin_name: str,
    bin_path: pathlib.Path,
    checksum: str,
    pkg: str,
    bin_dir: pathlib.Path,
    extracted_dir: pathlib.Path | None,
):
    """Install just's Fish completion file."""
    assert extracted_dir is not None

    completion_src = extracted_dir / "completions" / "just.fish"
    assert completion_src.is_file(), f"missing completion file: {completion_src}"

    completions_dir = _get_fish_config_dir() / "completions"
    completions_dir.mkdir(parents=True, exist_ok=True)

    completion_dest = completions_dir / "just.fish"
    timestamp = time.time_ns()
    temp_dest = completion_dest.with_name(f".just.fish.tmp.{timestamp}")

    shutil.copy2(completion_src, temp_dest)
    os.replace(temp_dest, completion_dest)


def _get_fish_config_dir() -> pathlib.Path:
    xdg_config_home = os.environ.get("XDG_CONFIG_HOME")
    if xdg_config_home:
        return pathlib.Path(xdg_config_home) / "fish"
    return pathlib.Path.home() / ".config" / "fish"


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"

    assert re.search(rf"^just {re.escape(version.lstrip('v'))}$", stdout), stdout
