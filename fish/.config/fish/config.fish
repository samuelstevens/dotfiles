# Editor should neovim
set -gx EDITOR nvim

# Set up path
fish_add_path /usr/local/bin
fish_add_path $HOME/.local/bin
fish_add_path $HOME/.local/bin/scripts
fish_add_path $HOME/.cargo/bin
fish_add_path $HOME/go/bin
if test -d /usr/local/go
    fish_add_path /usr/local/go/bin
end
if test -d $HOME/.docker/bin
    fish_add_path $HOME/.docker/bin
end
if test -d $HOME/.pyenv
    pyenv init - | source
end

if test -d /usr/local/texlive/2022/bin/universal-darwin
    fish_add_path /usr/local/texlive/2022/bin/universal-darwin
end

# Pyenv
set -gx PYENV_ROOT $HOME/.pyenv
fish_add_path $PYENV_ROOT/bin


# ripgrep config
set -gx RIPGREP_CONFIG_PATH $HOME/.config/ripgrep/ripgreprc

# Use ripgrep for fzf
set -gx FZF_DEFAULT_COMMAND rg --files

if status --is-interactive
    if test -f /opt/homebrew/bin/brew
        # Source the homebrew goodies to get my path set up
        /opt/homebrew/bin/brew shellenv | source
    end
    
    # Use vi key bindings instead of those disgusting emacs bindings
    fish_vi_key_bindings

    # I don't need any greeting for new shells
    set fish_greeting ''
end
