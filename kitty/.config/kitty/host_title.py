"""Keep window titles on the remote host, or the local hostname."""

import socket

from kittens.ssh.utils import get_connection_data


def local_hostname() -> str:
    return socket.gethostname().split(".")[0]


def ssh_target(cmdline: list[str]) -> str:
    """`ssh <target>` or `kitten ssh <target>` -> target."""
    # Kitty's parser keeps consuming arguments after --, including the remote
    # command. Restrict it to the destination following the option terminator.
    if "--" in cmdline:
        cmdline = cmdline[: cmdline.index("--") + 2]
    connection = get_connection_data(cmdline)
    return connection.hostname if connection else ""


def remote_hostname(window) -> str:
    for process in window.child.foreground_processes:
        cmdline = list(process["cmdline"] or ())
        if not cmdline:
            continue
        target = ssh_target(cmdline)
        if target:
            return target.rpartition("@")[2]
    return ""


def update_title(window) -> None:
    title = remote_hostname(window) or local_hostname()
    if window.title != title:
        window.set_title(title)


def on_title_change(boss, window, data: dict) -> None:
    # set_title also invokes this watcher. Only react to application titles.
    if data["from_child"]:
        update_title(window)


def on_focus_change(boss, window, data: dict) -> None:
    if data["focused"]:
        update_title(window)


def on_cmd_startstop(boss, window, data: dict) -> None:
    update_title(window)
