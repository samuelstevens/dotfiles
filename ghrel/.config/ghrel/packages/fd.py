import subprocess
import re

pkg = "sharkdp/fd"
asset = {
    "linux-x86_64": "fd-*-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "fd-*-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "fd-*-x86_64-unknown-linux-musl/fd",
    "darwin-arm64": "fd-v10.4.2-aarch64-apple-darwin/fd",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^fd [\d\.]*$", stdout)
