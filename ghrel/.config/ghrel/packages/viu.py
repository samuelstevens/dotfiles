import re
import subprocess


pkg = "atanunq/viu"
archive = False

asset = {
    "linux-x86_64": "viu-x86_64-unknown-linux-musl",
    "darwin-arm64": "viu-aarch64-apple-darwin",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(rf"^viu {re.escape(version.removeprefix('v'))}$", stdout), stdout
