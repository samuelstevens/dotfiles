import re
import subprocess


pkg = "lycheeverse/lychee"
asset = {
    "linux-x86_64": "lychee-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "lychee-arm64-macos.tar.gz",
}
binary = {
    "linux-x86_64": "lychee",
    "darwin-arm64": "lychee",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(rf"^lychee {re.escape(version.removeprefix('lychee-v'))}$", stdout), stdout
