import re
import subprocess


pkg = "caarlos0/timer"
version = "v1.4.6"

asset = {
    "linux-x86_64": "timer_linux_amd64.tar.gz",
    "linux-arm64": "timer_linux_arm64.tar.gz",
    "darwin-x86_64": "timer_darwin_all.tar.gz",
    "darwin-arm64": "timer_darwin_all.tar.gz",
}

binary = {
    "linux-x86_64": "timer",
    "linux-arm64": "timer",
    "darwin-x86_64": "timer",
    "darwin-arm64": "timer",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^timer version {re.escape(version.lstrip('v'))}$", stdout)
