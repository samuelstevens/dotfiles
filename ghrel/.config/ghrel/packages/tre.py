import re
import subprocess


pkg = "dduan/tre"
asset = {
    "linux-x86_64": "tre-*-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "tre-*-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "tre",
    "darwin-arm64": "tre",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    expected_version = version.removeprefix("v")
    assert re.search(rf"^tre-command {re.escape(expected_version)}$", stdout), stdout
