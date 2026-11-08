import subprocess

pkg = "can1357/oh-my-pi"
archive = False

asset = {
    "linux-x86_64": "omp-linux-x64",
    "linux-arm64": "omp-linux-arm64",
    "darwin-x86_64": "omp-darwin-x64",
    "darwin-arm64": "omp-darwin-arm64",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run(
        [bin_name, "--version"], capture_output=True, text=True, check=True
    )
    assert result.stdout.strip() == version.removeprefix("v"), result.stdout
