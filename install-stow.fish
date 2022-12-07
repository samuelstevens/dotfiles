mkdir -p ~/.local/src
cd ~/.local/src

# Download and untar
curl https://ftp.gnu.org/gnu/stow/stow-2.3.1.tar.gz --output stow-2.3.1.tar.gz
tar -xf stow-2.3.1.tar.gz

cd stow-2.3.1
./configure --prefix=$HOME/.local
make install

mkdir -p ~/.config
