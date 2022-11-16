#!/usr/bin/env bash

# clear screen with set -o vi
bind -m vi-command 'Control-l: clear-screen'
bind -m vi-insert 'Control-l: clear-screen'

# shared stuff
[[ -f ~/.sharedrc ]] && source ~/.sharedrc

# region third-party tools

[ -f ~/.fzf.bash ] && source ~/.fzf.bash

eval "$(starship init bash)"

if command -v zoxide 1>/dev/null 2>&1; then
  eval "$(zoxide init --cmd cd bash)"
fi

# endregion

[[ -r "/usr/local/etc/profile.d/bash_completion.sh" ]] && . "/usr/local/etc/profile.d/bash_completion.sh"

# If cd takes forever, then consider setting this command once, rather than upon every invocation.
cd() {
    if [[ $(type -t __zoxide_z) == "function" ]]; then
        __zoxide_z "$@"
    else
        builtin cd "$@"
    fi
}
. "$HOME/.cargo/env"
