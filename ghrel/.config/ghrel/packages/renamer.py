import re
import subprocess

pkg = "marcusbuffett/pipe-rename"
archive = False

asset = {
    "linux-x86_64": "renamer-*-x86_64-unknown-linux-musl",
    "linux-arm64": "renamer-*-aarch64-unknown-linux-gnu",
    "darwin-x86_64": "renamer-*-x86_64-apple-darwin",
    "darwin-arm64": "renamer-*-aarch64-apple-darwin",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^pipe-rename {re.escape(version.lstrip('v'))}$", stdout), stdout
