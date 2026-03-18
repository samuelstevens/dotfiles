import re
import subprocess


pkg = "chmln/sd"
asset = {
    "linux-x86_64": "sd-v*-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "sd-v*-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "sd",
    "darwin-arm64": "sd",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^sd [\d\.]+$", stdout)
