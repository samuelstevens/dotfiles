import subprocess
import re

pkg = "sharkdp/fd"
binary = "fd-*-aarch64-apple-darwin/fd"


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^fd [\d\.]*$", stdout)
