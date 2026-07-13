import subprocess

pkg = "openai/codex"
asset = {
    "linux-x86_64": "codex-code-mode-host-x86_64-unknown-linux-musl.tar.gz",
    "darwin-arm64": "codex-code-mode-host-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "*",
    "darwin-arm64": "*",
}


def ghrel_verify(*, version: str, bin_name: str):
    # codex-code-mode-host prints nothing on --version and blocks reading stdin
    # until EOF; only the exit code is checkable.
    result = subprocess.run(
        [bin_name, "--version"],
        stdin=subprocess.DEVNULL,
        capture_output=True,
        text=True,
        timeout=10,
    )
    assert result.returncode == 0
