import re
import subprocess


pkg = "karimknaebel/turm"

asset = {
    "linux-x86_64": "turm-x86_64-unknown-linux-musl.tar.gz",
    "linux-arm64": "turm-aarch64-unknown-linux-musl.tar.gz",
}

binary = {
    "linux-x86_64": "turm",
    "linux-arm64": "turm",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^turm {re.escape(version.lstrip('v'))}$", stdout), stdout
