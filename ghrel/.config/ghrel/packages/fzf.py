import re
import subprocess

pkg = "junegunn/fzf"

asset = {
    "linux-x86_64": "fzf-*-linux_amd64.tar.gz",
    "linux-arm64": "fzf-*-linux_arm64.tar.gz",
    "darwin-x86_64": "fzf-*-darwin_amd64.tar.gz",
    "darwin-arm64": "fzf-*-darwin_arm64.tar.gz",
}

binary = {
    "linux-x86_64": "fzf",
    "linux-arm64": "fzf",
    "darwin-x86_64": "fzf",
    "darwin-arm64": "fzf",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"

    assert re.search(rf"^{re.escape(version.lstrip('v'))}(?: .*)?$", stdout), stdout
