"""Tab titles show the remote host of the active window, or the local hostname."""

import os
import socket

from kittens.ssh.utils import get_connection_data
from kitty.boss import get_boss


def local_hostname() -> str:
    return socket.gethostname().split(".")[0]


def herdr_target(cmdline: list[str]) -> str:
    """`herdr --remote <ssh-target>` -> ssh-target."""
    if os.path.basename(cmdline[0]) != "herdr" or "--remote" not in cmdline[:-1]:
        return ""
    return cmdline[cmdline.index("--remote") + 1]


def ssh_target(cmdline: list[str]) -> str:
    """`ssh <target>` or `kitten ssh <target>` -> target."""
    connection = get_connection_data(cmdline)
    return connection.hostname if connection else ""


def remote_hostname(window) -> str:
    for process in window.child.foreground_processes:
        cmdline = list(process["cmdline"] or ())
        if not cmdline:
            continue
        target = herdr_target(cmdline) or ssh_target(cmdline)
        if target:
            return target.rpartition("@")[2]
    return ""


def draw_title(data: dict) -> str:
    tab = get_boss().tab_for_id(data["tab_id"])
    window = tab.active_window if tab else None
    return (window and remote_hostname(window)) or local_hostname()
