import re
import subprocess

pkg = "openai/codex"
asset = {
    "linux-x86_64": "codex-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "codex-x86_64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "*",
    "darwin-arm64": "*",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^codex-cli [\d\.]*$", stdout)
