import re
import subprocess

pkg = "tailwindlabs/tailwindcss"
archive = False

asset = {
    "linux-x86_64": "tailwindcss-linux-x64",
    "linux-arm64": "tailwindcss-linux-arm64",
    "darwin-x86_64": "tailwindcss-macos-x64",
    "darwin-arm64": "tailwindcss-macos-arm64",
}


def ghrel_verify(*, version: str, bin_name: str):
    result = subprocess.run([bin_name, "--help"], capture_output=True, text=True)
    assert result.returncode == 0, f"exit code {result.returncode}: {result.stderr}"

    stdout = result.stdout.strip()
    assert stdout, "no help output"

    first_line = stdout.splitlines()[0].strip()
    assert re.search(
        rf"^≈ tailwindcss {re.escape(version)}$",
        first_line,
    ), first_line
