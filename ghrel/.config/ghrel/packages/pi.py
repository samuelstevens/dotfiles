import pathlib
import shutil
import subprocess

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
    # Where to install the full pi directory
    install_dir = pathlib.Path.home() / ".local" / "share" / "ghrel" / "pi"

    # Remove old installation if it exists
    if install_dir.exists():
        shutil.rmtree(install_dir)

    # Copy entire pi/ directory from extracted archive
    src_dir = extracted_dir / "pi"
    shutil.copytree(src_dir, install_dir)

    # Make the binary executable
    actual_binary = install_dir / "pi"
    actual_binary.chmod(0o755)

    # Remove the binary ghrel installed (we'll replace with symlink)
    if bin_path.exists() or bin_path.is_symlink():
        bin_path.unlink()

    # Create symlink: ~/.local/bin/pi -> ~/.local/share/ghrel/pi/pi
    bin_path.symlink_to(actual_binary)


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"
    # pi --version outputs something like "0.50.6"
    assert result.stdout.strip(), "no version output"
