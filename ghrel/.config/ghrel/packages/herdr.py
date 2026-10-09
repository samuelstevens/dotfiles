import subprocess

pkg = "herdrdev/herdr"
archive = False

asset = {
    "linux-x86_64": "herdr-linux-x86_64",
    "linux-arm64": "herdr-linux-aarch64",
    "darwin-x86_64": "herdr-macos-x86_64",
    "darwin-arm64": "herdr-macos-aarch64",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"
    assert result.stdout.strip() == f"herdr {version.removeprefix('v')}", result.stdout
