import os
import pathlib
import re
import shutil
import stat
import subprocess
import time

pkg = "fish-shell/fish-shell"
asset = {
    "linux-x86_64": "fish-*-linux-x86_64.tar.xz",
    "linux-arm64": "fish-*-linux-aarch64.tar.xz",
    "darwin-arm64": "fish-*.app.zip",
}
binary = {
    "linux-x86_64": "fish",
    "linux-arm64": "fish",
    "darwin-arm64": "fish-*.app/Contents/Resources/base/usr/local/bin/fish",
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
    # The macOS release bundles fish with its support files under usr/local.
    # Keep that tree together so fish can still find its bundled resources.
    if extracted_dir is None or os.uname().sysname != "Darwin":
        return

    install_root = _find_install_root(extracted_dir)
    base_dpath = pathlib.Path.home() / ".local" / "share" / "ghrel"
    install_dpath = base_dpath / "fish"
    timestamp = time.time_ns()

    base_dpath.mkdir(parents=True, exist_ok=True)

    staging_dpath = base_dpath / f"fish.new.{timestamp}"
    assert not staging_dpath.exists()
    shutil.copytree(install_root, staging_dpath)
    _ensure_executable(staging_dpath / "bin" / "fish")

    if install_dpath.exists():
        if install_dpath.is_symlink():
            install_dpath.unlink()
        else:
            old_dpath = base_dpath / f"fish.old.{timestamp}"
            install_dpath.rename(old_dpath)

    staging_dpath.rename(install_dpath)

    temp_link_fpath = bin_path.with_name(f".{bin_name}.tmp.{timestamp}")
    if temp_link_fpath.exists() or temp_link_fpath.is_symlink():
        temp_link_fpath.unlink()
    temp_link_fpath.symlink_to(install_dpath / "bin" / "fish")
    assert not bin_path.is_dir()
    os.replace(temp_link_fpath, bin_path)

    for pattern in ("fish.old.*", "fish.new.*"):
        for old_dpath in base_dpath.glob(pattern):
            if old_dpath == install_dpath:
                continue
            try:
                shutil.rmtree(old_dpath)
            except OSError:
                pass


def _find_install_root(extracted_dir: pathlib.Path) -> pathlib.Path:
    matches = list(extracted_dir.glob("fish-*.app/Contents/Resources/base/usr/local"))
    assert len(matches) == 1, f"expected one fish install root, found {len(matches)}"
    return matches[0]


def _ensure_executable(path: pathlib.Path) -> None:
    mode = path.stat().st_mode
    exec_bits = 0
    if mode & stat.S_IRUSR:
        exec_bits |= stat.S_IXUSR
    if mode & stat.S_IRGRP:
        exec_bits |= stat.S_IXGRP
    if mode & stat.S_IROTH:
        exec_bits |= stat.S_IXOTH
    path.chmod(mode | exec_bits)


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^fish, version {re.escape(version.lstrip('v'))}$", stdout), stdout
