import re
import subprocess


pkg = "Wilfred/difftastic"
asset = {
    "linux-x86_64": "difft-x86_64-unknown-linux-gnu.tar.gz",
    "darwin-arm64": "difft-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "difft",
    "darwin-arm64": "difft",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    expected_version = version.removeprefix("difftastic-").removeprefix("v")
    assert re.search(rf"\b{re.escape(expected_version)}\b", stdout), stdout
