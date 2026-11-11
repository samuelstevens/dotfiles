import subprocess

pkg = "atuinsh/atuin"

asset = {
    "linux-x86_64": "atuin-x86_64-unknown-linux-musl.tar.gz",
    "linux-arm64": "atuin-aarch64-unknown-linux-musl.tar.gz",
    "darwin-x86_64": "atuin-x86_64-apple-darwin.tar.gz",
    "darwin-arm64": "atuin-aarch64-apple-darwin.tar.gz",
}
binary = {
    "linux-x86_64": "atuin-x86_64-unknown-linux-musl/atuin",
    "linux-arm64": "atuin-aarch64-unknown-linux-musl/atuin",
    "darwin-x86_64": "atuin-x86_64-apple-darwin/atuin",
    "darwin-arm64": "atuin-aarch64-apple-darwin/atuin",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=True
    )
    expected = f"atuin {version.removeprefix('v')} "
    assert result.stdout.startswith(expected), result.stdout
