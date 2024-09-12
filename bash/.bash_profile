#!/usr/bin/env bash

# clear screen with set -o vi
bind -m vi-command 'Control-l: clear-screen'
bind -m vi-insert 'Control-l: clear-screen'

# shared stuff
[[ -f ~/.sharedrc ]] && source ~/.sharedrc

. "$HOME/.cargo/env"
