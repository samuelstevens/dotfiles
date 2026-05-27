import pathlib
import subprocess
import sys
import typing

pkg = "github/copilot-language-server-release"

asset = {
    "linux-x86_64": "copilot-language-server-linux-x64-*.zip",
    "linux-arm64": "copilot-language-server-linux-arm64-*.zip",
    "darwin-x86_64": "copilot-language-server-darwin-x64-*.zip",
    "darwin-arm64": "copilot-language-server-darwin-arm64-*.zip",
}

binary = {
    "linux-x86_64": "copilot-language-server",
    "linux-arm64": "copilot-language-server",
    "darwin-x86_64": "copilot-language-server",
    "darwin-arm64": "copilot-language-server",
}


def ghrel_post_install(
    *,
    version: str,
    bin_name: str,
    bin_path: pathlib.Path,
    checksum: str,
    pkg: str,
    bin_dir: pathlib.Path,
    extracted_dir: typing.Optional[pathlib.Path],
):
    if sys.platform != "darwin":
        return

    result = subprocess.run(
        ["xattr", "-d", "com.apple.quarantine", str(bin_path)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0 and "No such xattr" not in result.stderr:
        raise RuntimeError(result.stderr.strip() or f"xattr exited {result.returncode}")


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert stdout == version, stdout
