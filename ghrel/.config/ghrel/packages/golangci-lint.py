import re
import subprocess

pkg = "golangci/golangci-lint"

asset = {
    "linux-x86_64": "golangci-lint-*-linux-amd64.tar.gz",
    "darwin-arm64": "golangci-lint-*-darwin-arm64.tar.gz",
}
binary = {
    "linux-x86_64": "golangci-lint-*-linux-amd64/golangci-lint",
    "darwin-arm64": "golangci-lint-*-darwin-arm64/golangci-lint",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"

    assert re.search(
        rf"^golangci-lint has version {re.escape(version.lstrip('v'))}\b",
        stdout,
    ), stdout
