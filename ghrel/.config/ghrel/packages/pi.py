import os
import pathlib
import shutil
import subprocess
import time

pkg = "badlogic/pi-mono"
asset = {
    "linux-x86_64": "pi-linux-x64.tar.gz",
    "darwin-arm64": "pi-darwin-arm64.tar.gz",
}
binary = {"linux-x86_64": "pi/pi", "darwin-arm64": "pi/pi"}


def ghrel_post_install(
    *,
    version: str,
    bin_name: str,
    bin_path: pathlib.Path,
    checksum: str,
    pkg: str,
    bin_dir: pathlib.Path,
    extracted_dir: pathlib.Path,
):
    """Install pi with its full directory structure (it needs package.json etc)."""
    base_dpath = pathlib.Path.home() / ".local" / "share" / "ghrel"
    install_dpath = base_dpath / "pi"
    timestamp = time.time_ns()

    base_dpath.mkdir(parents=True, exist_ok=True)

    assert extracted_dir is not None
    src_dpath = extracted_dir / "pi"
    assert src_dpath.is_dir()

    staging_dpath = base_dpath / f"pi.new.{timestamp}"
    assert not staging_dpath.exists()
    shutil.copytree(src_dpath, staging_dpath)

    staged_bin_fpath = staging_dpath / "pi"
    assert staged_bin_fpath.is_file()
    staged_bin_fpath.chmod(0o755)

    if install_dpath.exists():
        if install_dpath.is_symlink():
            install_dpath.unlink()
        else:
            old_dpath = base_dpath / f"pi.old.{timestamp}"
            install_dpath.rename(old_dpath)

    staging_dpath.rename(install_dpath)

    temp_link_fpath = bin_path.with_name(f".{bin_name}.tmp.{timestamp}")
    if temp_link_fpath.exists() or temp_link_fpath.is_symlink():
        temp_link_fpath.unlink()
    temp_link_fpath.symlink_to(install_dpath / "pi")
    assert not bin_path.is_dir()
    os.replace(temp_link_fpath, bin_path)

    cleanup_failures: list[pathlib.Path] = []
    for pattern in ("pi.old.*", "pi.new.*"):
        for old_dpath in base_dpath.glob(pattern):
            try:
                shutil.rmtree(old_dpath)
            except OSError:
                cleanup_failures.append(old_dpath)

    if cleanup_failures:
        paths = ", ".join(str(old_dpath) for old_dpath in cleanup_failures)
        print(f"Note: Could not remove old directories (will retry later): {paths}")


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"
    # pi --version outputs something like "0.50.6"
    assert result.stdout.strip(), "no version output"
