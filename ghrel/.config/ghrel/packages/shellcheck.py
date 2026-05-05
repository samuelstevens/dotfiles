import re
import subprocess


pkg = "koalaman/shellcheck"
asset = {
    "linux-x86_64": "shellcheck-*.linux.x86_64.tar.gz",
    "darwin-arm64": "shellcheck-*.darwin.aarch64.tar.gz",
}
binary = {
    "linux-x86_64": "shellcheck-*/shellcheck",
    "darwin-arm64": "shellcheck-*/shellcheck",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    expected_version = version.removeprefix("v")
    assert re.search(
        rf"^version: {re.escape(expected_version)}$", stdout, re.MULTILINE
    ), stdout
