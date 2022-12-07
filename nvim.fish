cd ~/.local/share/nvim/site/pack/

rm -rf packer paq

mkdir -p samstevens/start
cd samstevens/start

# Packages
git clone https://github.com/nvim-treesitter/nvim-treesitter.git
git clone https://github.com/jaawerth/fennel.vim
