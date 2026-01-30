import re
import subprocess

pkg = "openai/codex"
asset = "codex-aarch64-apple-darwin.tar.gz"
binary = "codex-aarch64-apple-darwin"


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^codex-cli [\d\.]*$", stdout)
