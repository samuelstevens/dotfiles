import re
import subprocess

pkg = "jesseduffield/lazygit"
asset = {
    "linux-x86_64": "lazygit_*_linux_x86_64.tar.gz",
    "darwin-arm64": "lazygit_*_darwin_arm64.tar.gz",
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

    assert re.search(r"^commit=.*,.*git version=.*$", stdout)
