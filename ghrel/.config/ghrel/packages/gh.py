import re
import subprocess

pkg = "cli/cli"
asset = {
    "linux-x86_64": "gh_*_linux_amd64.tar.gz",
    "darwin-arm64": "*",
}
binary = {
    "linux-x86_64": "gh_*_linux_amd64/bin/gh",
    "darwin-arm64": "*",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    msg = f"stdout: {result.stdout}\n\nstderr: {result.stderr}"
    stdout = result.stdout.strip()
    assert stdout, msg
    assert re.search(r"^gh version .*$", stdout, flags=re.MULTILINE), msg
