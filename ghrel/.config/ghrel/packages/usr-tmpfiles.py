import re
import subprocess

pkg = "samuelstevens/usr-tmpfiles"

asset = {
    "darwin-arm64": "usr-tmpfiles-*-darwin-arm64.tar.gz",
    "linux-x86_64": "usr-tmpfiles-*-linux-x86_64.tar.gz",
}

binary = {
    "darwin-arm64": "usr-tmpfiles",
    "linux-x86_64": "usr-tmpfiles",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"

    assert re.search(rf"^usr-tmpfiles {re.escape(version.lstrip('v'))}$", stdout), stdout
