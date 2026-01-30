import re
import subprocess

pkg = "BurntSushi/ripgrep"
asset = "ripgrep-*-aarch64-apple-darwin.tar.gz"
binary = "ripgrep-*-aarch64-apple-darwin/rg"


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^ripgrep [\d\.]+", stdout)
