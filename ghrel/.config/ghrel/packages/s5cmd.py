import re
import subprocess


pkg = "peak/s5cmd"

asset = {
    "linux-x86_64": "s5cmd_*_Linux-64bit.tar.gz",
    "linux-arm64": "s5cmd_*_Linux-arm64.tar.gz",
    "darwin-x86_64": "s5cmd_*_macOS-64bit.tar.gz",
    "darwin-arm64": "s5cmd_*_macOS-arm64.tar.gz",
}

binary = {
    "linux-x86_64": "s5cmd",
    "linux-arm64": "s5cmd",
    "darwin-x86_64": "s5cmd",
    "darwin-arm64": "s5cmd",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^v{re.escape(version.lstrip('v'))}(?:[-+].*)?$", stdout), stdout
