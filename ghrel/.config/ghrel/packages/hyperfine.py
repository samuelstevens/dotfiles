import re
import subprocess


pkg = "sharkdp/hyperfine"
asset = {
    "linux-x86_64": "hyperfine-v*-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "hyperfine-v*-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "hyperfine-v*-x86_64-unknown-linux-musl/hyperfine",
    "darwin-arm64": "hyperfine-v*-aarch64-apple-darwin/hyperfine",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(rf"^hyperfine {re.escape(version.removeprefix('v'))}$", stdout)
