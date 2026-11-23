import subprocess

# Copies to the local clipboard over OSC 52, so pbcopy works on remote hosts.
# macOS has a native pbcopy, so no darwin asset.
pkg = "skaji/remote-pbcopy"
asset = {
    "linux-x86_64": "pbcopy-linux-amd64.tar.gz",
    "linux-arm64": "pbcopy-linux-arm64.tar.gz",
}
binary = {platform: "pbcopy" for platform in asset}


def ghrel_verify(*, version: str, bin_name: str):
    # The binary has no version flag; it prints usage and exits 1 on --help.
    result = subprocess.run(
        [bin_name, "--help"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 1, f"exit code {result.returncode}: {result.stderr}"
    assert result.stdout.startswith("Usage:\n  pbcopy FILE"), result.stdout
