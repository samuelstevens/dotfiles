import re
import subprocess

pkg = "quint-co/quint"
archive = False

asset = {
    "linux-x86_64": "quint-linux-amd64",
    "linux-arm64": "quint-linux-arm64",
    "darwin-x86_64": "quint-macos-amd64",
    "darwin-arm64": "quint-macos-arm64",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert re.fullmatch(re.escape(version.removeprefix("v")), stdout), stdout
