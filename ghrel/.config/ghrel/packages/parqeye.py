import re
import subprocess


pkg = "kaushiksrini/parqeye"

asset = {
    "linux-x86_64": "parqeye-x86_64-unknown-linux-musl.tar.xz",
    "linux-arm64": "parqeye-aarch64-unknown-linux-gnu.tar.xz",
    "darwin-x86_64": "parqeye-x86_64-apple-darwin.tar.xz",
    "darwin-arm64": "parqeye-aarch64-apple-darwin.tar.xz",
}

binary = {
    "linux-x86_64": "parqeye-x86_64-unknown-linux-musl/parqeye",
    "linux-arm64": "parqeye-aarch64-unknown-linux-gnu/parqeye",
    "darwin-x86_64": "parqeye-x86_64-apple-darwin/parqeye",
    "darwin-arm64": "parqeye-aarch64-apple-darwin/parqeye",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--version"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no version output"
    assert re.search(rf"^parqeye {re.escape(version.lstrip('v'))}$", stdout), stdout
