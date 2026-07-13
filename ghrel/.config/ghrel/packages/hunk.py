import re
import subprocess

pkg = "modem-dev/hunk"
asset = {
    "linux-x86_64": "hunkdiff-linux-x64.tar.gz",
    "linux-arm64": "hunkdiff-linux-arm64.tar.gz",
    "darwin-x86_64": "hunkdiff-darwin-x64.tar.gz",
    "darwin-arm64": "hunkdiff-darwin-arm64.tar.gz",
}
binary = {
    "linux-x86_64": "hunkdiff-linux-x64/hunk",
    "linux-arm64": "hunkdiff-linux-arm64/hunk",
    "darwin-x86_64": "hunkdiff-darwin-x64/hunk",
    "darwin-arm64": "hunkdiff-darwin-arm64/hunk",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"

    assert re.search(rf"^{re.escape(version.lstrip('v'))}$", stdout), stdout
