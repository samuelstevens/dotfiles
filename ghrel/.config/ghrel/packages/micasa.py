import re
import subprocess

pkg = "micasa-dev/micasa"

asset = {
    "linux-x86_64": "micasa_linux_amd64.tar.gz",
    "linux-arm64": "micasa_linux_arm64.tar.gz",
    "darwin-x86_64": "micasa_darwin_amd64.tar.gz",
    "darwin-arm64": "micasa_darwin_arm64.tar.gz",
}
binary = {
    "linux-x86_64": "micasa",
    "linux-arm64": "micasa",
    "darwin-x86_64": "micasa",
    "darwin-arm64": "micasa",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0

    stdout = result.stdout.strip()
    assert stdout

    assert re.search(r"^micasa .* [\d\.]*$", stdout)
