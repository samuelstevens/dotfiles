import re
import subprocess

pkg = "brave/brave-search-cli"
archive = False

asset = {
    "linux-x86_64": "bx-*-linux-amd64",
    "linux-arm64": "bx-*-linux-arm64",
    "darwin-arm64": "bx-*-darwin-arm64",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^bx {re.escape(version.lstrip('v'))}$", stdout), stdout
