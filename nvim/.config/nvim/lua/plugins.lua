local function ensurePacker()
  local installPath = vim.fn.stdpath('data')..'/site/pack/packer/start/packer.nvim'

  if vim.fn.empty(vim.fn.glob(installPath)) > 0 then
    vim.fn.system{'git', 'clone', '--depth', '1', 'https://github.com/wbthomason/packer.nvim', installPath}
    vim.cmd 'packadd packer.nvim'
    return true
  end

  return false
end

local packerBoostrap = ensurePacker()

return require('packer').startup(function(use) 
  use 'wbthomason/packer.nvim'

  use 'nvim-lua/plenary.nvim'
  use 'nvim-telescope/telescope.nvim'
  use 'numToStr/Comment.nvim'
  use 'averms/black-nvim'
  use 'neovim/nvim-lspconfig'
  use {'nvim-telescope/telescope-fzf-native.nvim', run = 'make' }
  use 'f-person/git-blame.nvim'
  use 'dag/vim-fish'
  use 'tpope/vim-eunuch'
  use 'tpope/vim-vinegar'
  use 'ggandor/leap.nvim'
  use 'tpope/vim-repeat' -- required by leap

  if packerBootsrap then
    require('packer').sync()
  end
end)
