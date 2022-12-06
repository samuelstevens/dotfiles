local function vimopt(opts)
  for key, value in pairs(opts) do
    vim.opt[key] = value
  end
  return nil
end
local function vimg(key, value)
  vim.g[key] = value
  return nil
end
local function cmd(str)
  return vim.cmd(str)
end
local function iabbrev(wrong, right)
  return cmd(("iabbrev" .. " " .. wrong .. " " .. right))
end
vimopt({number = true, background = "light", autoindent = true, autoread = true, cursorline = true, hidden = true, laststatus = 2, modelines = 0, scrolloff = 2, showcmd = true, mouse = "", wrap = true, linebreak = true, ignorecase = true, smartcase = true, gdefault = true, hlsearch = true, incsearch = true, tabstop = 2, softtabstop = 2, expandtab = true, shiftwidth = 2, swapfile = false})
cmd("syntax enable")
cmd("colorscheme solarized")
cmd("hi Comment cterm=bold ctermfg=240")
iabbrev("tehn", "then")
iabbrev("waht", "what")
vimg("mapleader", " ")
do
  local venv = (vim.env.HOME .. "/.local/venv/nvim")
  vimg("python3_host_prog", (venv .. "/bin/python"))
end
vimg("netrw_banner", 0)
vimg("netrw_keepdir", 0)
if vim.fn.executable("rg") then
  vimopt({grepprg = "rg --vimgrep $*", grepformat = "%f:%l:%c:%m"})
else
end
vim.api.nvim_set_keymap("n", "<leader>/", ":grep ", {noremap = true})
local function treesitter_config()
  return {ensure_installed = {"lua", "rust", "toml", "python", "fennel"}, auto_install = true, highlight = {enable = true, additional_vim_regex_highlighting = false}, indent = {enable = true}, rainbow = {enable = true, extended_mode = true, max_file_lines = nil}}
end
do
  local treesitter = require("nvim-treesitter.configs")
  treesitter.setup(treesitter_config())
end
vimopt({foldmethod = "expr", foldexpr = "nvim_treesitter#foldexpr()"})
vim.api.nvim_set_keymap("n", "o", "o<esc>", {noremap = true})
vim.api.nvim_set_keymap("n", "O", "O<esc>", {noremap = true})
vim.api.nvim_set_keymap("n", "<c-e>", "<c-^>", {noremap = true})
vim.api.nvim_set_keymap("n", "<leader><cr>", ":nohlsearch<CR>", {noremap = true})
vim.api.nvim_set_keymap("n", "gp", "vi(gx", {noremap = false})
vim.api.nvim_set_keymap("n", "-", ":edit .<cr>", {noremap = false})
do
  local ctrlp = require("ctrlp")
  ctrlp.setup("~/.fzf")
end
do
  local surround = require("surround")
  surround.setup()
end
local commented = require("commented")
return commented.setup()
