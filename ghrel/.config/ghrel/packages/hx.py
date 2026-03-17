import os
import pathlib
import re
import shutil
import subprocess
import time

pkg = "helix-editor/helix"
asset = {
    "darwin-arm64": "helix-*-aarch64-macos.tar.xz",
    "darwin-x86_64": "helix-*-x86_64-macos.tar.xz",
    "linux-arm64": "helix-*-aarch64-linux.tar.xz",
    "linux-x86_64": "helix-*-x86_64-linux.tar.xz",
}
binary = {
    "darwin-arm64": "hx",
    "darwin-x86_64": "hx",
    "linux-arm64": "hx",
    "linux-x86_64": "hx",
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
    """Install Helix's bundled runtime alongside the binary."""
    assert extracted_dir is not None

    runtime_src = _find_runtime_dir(extracted_dir)
    helix_config_dir = _get_helix_config_dir()
    runtime_dest = helix_config_dir / "runtime"
    timestamp = time.time_ns()

    helix_config_dir.mkdir(parents=True, exist_ok=True)

    staging_dest = helix_config_dir / f"runtime.new.{timestamp}"
    old_dest = helix_config_dir / f"runtime.old.{timestamp}"
    shutil.copytree(runtime_src, staging_dest)

    if runtime_dest.exists() or runtime_dest.is_symlink():
        if runtime_dest.is_symlink():
            runtime_dest.unlink()
        else:
            runtime_dest.rename(old_dest)

    os.replace(staging_dest, runtime_dest)

    if old_dest.exists():
        shutil.rmtree(old_dest)


def _find_runtime_dir(extracted_dir: pathlib.Path) -> pathlib.Path:
    matches = [
        candidate
        for candidate in extracted_dir.rglob("runtime")
        if candidate.is_dir()
    ]
    assert len(matches) == 1, f"expected one runtime dir, found {len(matches)}"
    return matches[0]


def _get_helix_config_dir() -> pathlib.Path:
    xdg_config_home = os.environ.get("XDG_CONFIG_HOME")
    if xdg_config_home:
        return pathlib.Path(xdg_config_home) / "helix"
    return pathlib.Path.home() / ".config" / "helix"


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^helix {re.escape(version.lstrip('v'))}(?: .*)?$", stdout), stdout
