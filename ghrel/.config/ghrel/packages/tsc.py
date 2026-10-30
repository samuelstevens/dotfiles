import os
import pathlib
import re
import shutil
import subprocess
import time

pkg = "microsoft/TypeScript"
asset = {
    "linux-x86_64": "typescript-linux-x64.tgz",
    "linux-arm64": "typescript-linux-arm64.tgz",
    "darwin-x86_64": "typescript-darwin-x64.tgz",
    "darwin-arm64": "typescript-darwin-arm64.tgz",
}
binary = {
    "linux-x86_64": "package/lib/tsc",
    "linux-arm64": "package/lib/tsc",
    "darwin-x86_64": "package/lib/tsc",
    "darwin-arm64": "package/lib/tsc",
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
    # tsc needs the standard-library declaration files next to its executable.
    assert extracted_dir is not None
    source_dpath = extracted_dir / "package" / "lib"
    assert source_dpath.is_dir()

    base_dpath = pathlib.Path.home() / ".local" / "share" / "ghrel"
    install_dpath = base_dpath / "typescript"
    timestamp = time.time_ns()
    staging_dpath = base_dpath / f"typescript.new.{timestamp}"

    base_dpath.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source_dpath, staging_dpath)

    old_dpath = base_dpath / f"typescript.old.{timestamp}"
    if install_dpath.exists():
        if install_dpath.is_symlink():
            install_dpath.unlink()
        else:
            install_dpath.rename(old_dpath)
    staging_dpath.rename(install_dpath)

    temporary_link = bin_path.with_name(f".{bin_name}.tmp.{timestamp}")
    temporary_link.symlink_to(install_dpath / "tsc")
    assert not bin_path.is_dir()
    os.replace(temporary_link, bin_path)

    for stale_dpath in base_dpath.glob("typescript.old.*"):
        try:
            shutil.rmtree(stale_dpath)
        except OSError:
            pass


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert re.fullmatch(rf"Version {re.escape(version.lstrip('v'))}", stdout), stdout
