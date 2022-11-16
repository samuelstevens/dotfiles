# Getting Started

Install stow.
Good luck.

Install dotfiles:

```sh
git clone https://github.com/samuelstevens/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
stow --no-folding tmux
stow --no-folding fish
stow --no-folding ripgrep
stow --no-folding nvim
stow --no-folding lazygit
stow --no-folding bash
```

## Install Required Tools

[pyenv](https://github.com/pyenv/pyenv#basic-github-checkout)

[Build dependencies](https://github.com/pyenv/pyenv/wiki#suggested-build-environment)

```sh
 git clone https://github.com/pyenv/pyenv.git ~/.pyenv
 cd ~/.pyenv && src/configure && make -C src
```

[fzf](https://github.com/junegunn/fzf#using-git)

```sh
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

Then run your shell again (exit/ssh again, run `fish`, etc).

## Install Useful Tools

[neovim](https://github.com/neovim/neovim/releases/)

```
mkdir -p ~/.local/venv
cd ~/.local/venv
python -m venv nvim

source nvim/bin/activate.fish

pip install pynvim black 'python-lsp-server[all]'
```

[tmux](https://github.com/tmux/tmux/wiki/Installing#installing-tmux)

```
mkdir -p ~/.local/src
cd ~/.local/src
wget https://github.com/tmux/tmux/releases/download/3.3a/tmux-3.3a.tar.gz
tar -xf tmux-3.3a.tar.gz
cd tmux-3.3a
./configure --prefix ~/.local && make
make install
```

[ripgrep](https://github.com/BurntSushi/ripgrep/releases/tag/13.0.0)

[fd](https://github.com/sharkdp/fd/releases/tag/v8.4.0)

[fish](https://fishshell.com)

```sh
wget https://github.com/fish-shell/fish-shell/releases/download/3.5.1/fish-3.5.1.tar.xz 
tar fish-3.5.1.tar.xz
cd fish-3.5.1
mkdir build
cd build
cmake -DCMAKE_INSTALL_PREFIX=$HOME/.local ..
make
make install
```

## Using Nix For Tools

```
nix-env -iA nixpkgs.fish
nix-env -iA nixpkgs.tmux
nix-env -iA nixpkgs.fzf
nix-env -iA nixpkgs.neovim
nix-env -iA nixpkgs.ripgrep
nix-env -iA nixpkgs.fd
nix-env -iA nixpkgs.pv
nix-env -iA nixpkgs.lazygit
```
