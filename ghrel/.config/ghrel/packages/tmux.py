import subprocess

pkg = "tmux/tmux-builds"

asset = {
    "linux-x86_64": "tmux-*-linux-x86_64.tar.gz",
    "linux-arm64": "tmux-*-linux-arm64.tar.gz",
    "darwin-x86_64": "tmux-*-macos-x86_64.tar.gz",
    "darwin-arm64": "tmux-*-macos-arm64.tar.gz",
}

binary = {
    "linux-x86_64": "tmux",
    "linux-arm64": "tmux",
    "darwin-x86_64": "tmux",
    "darwin-arm64": "tmux",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "-V"], capture_output=True, text=True, check=False
    )
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout == f"tmux {version.lstrip('v')}", stdout
