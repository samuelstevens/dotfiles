import re
import subprocess

pkg = "Schniz/fnm"

asset = {
    "linux-x86_64": "fnm-linux.zip",
    "linux-arm64": "fnm-arm64.zip",
    "darwin-x86_64": "fnm-macos.zip",
    "darwin-arm64": "fnm-macos.zip",
}

binary = {
    "linux-x86_64": "fnm",
    "linux-arm64": "fnm",
    "darwin-x86_64": "fnm",
    "darwin-arm64": "fnm",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"

    assert re.search(rf"^fnm {re.escape(version.lstrip('v'))}$", stdout), stdout
