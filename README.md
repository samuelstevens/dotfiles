# Getting Started

Install [stow](https://ftp.gnu.org/gnu/stow/) and extract the source code.

```sh
./configure --prefix=$HOME/.local
make install
```

Install dotfiles:

```sh
git clone https://github.com/samuelstevens/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
uv run stow-all.py
```

List packages or preview changes first:

```sh
uv run stow-all.py --list
uv run stow-all.py --dry-run
```

You might need to remove some old Neovim configs:

## Install Required Tools

[fzf](https://github.com/junegunn/fzf#using-git)

```sh
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```

Then run your shell again (exit/ssh again, run `fish`, etc).

## Install Useful Tools


[tmux](https://github.com/tmux/tmux/wiki/Installing#installing-tmux)

Ubuntu 22.04 `apt` only provides `tmux 3.2a`, so install a newer release from source into `~/.local`:

```sh
mkdir -p ~/.local/src
cd ~/.local/src
curl -L -o tmux-3.6a.tar.gz https://github.com/tmux/tmux/releases/download/3.6a/tmux-3.6a.tar.gz
tar -xzf tmux-3.6a.tar.gz
cd tmux-3.6a
./configure --prefix="$HOME/.local"
make -j"$(nproc)"
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
