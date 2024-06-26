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
vim.api.nvim_set_keymap("n", "o", "o<esc>", {noremap = true})
vim.api.nvim_set_keymap("n", "O", "O<esc>", {noremap = true})
vim.api.nvim_set_keymap("n", "<c-w>|", "<c-w>v", {noremap = true})
vim.api.nvim_set_keymap("n", "<c-w>-", "<c-w>s", {noremap = true})
vim.api.nvim_set_keymap("n", "<c-w>\\", "<c-w>v", {noremap = true})
vim.api.nvim_set_keymap("n", "<c-w>_", "<c-w>s", {noremap = true})
vim.api.nvim_set_keymap("n", "<c-e>", "<c-^>", {noremap = true})
vim.api.nvim_set_keymap("n", "<tab>", ":bnext<CR>", {noremap = true})
vim.api.nvim_set_keymap("n", "<s-tab>", ":bprev<CR>", {noremap = true})
vim.api.nvim_set_keymap("n", "<leader><cr>", ":nohlsearch<CR>", {noremap = true})
vim.api.nvim_set_keymap("n", "gp", "vi(gx", {noremap = false})
cmd("command Striptrailingwhitespace %s/\\s\\+$//e")
vim.keymap.set("", "ge", "G")
vim.keymap.set("", "gh", "0")
vim.keymap.set("", "gl", "$")
vim.keymap.set("", "ga", "<c-^>")
vim.api.nvim_set_keymap("n", "-", ":edit .<cr>", {noremap = false})
do
  local functions = require("functions")
  local function _2_(ev)
    return functions["add-file-suffix"]()
  end
  vim.api.nvim_create_autocmd("BufEnter", {pattern = "*", callback = _2_})
end
do
  local filefinder = require("filefinder")
  filefinder.setup("~/.fzf", "<leader>f")
end
do
  local surround = require("surround")
  surround.setup()
end
do
  local commented = require("commented")
  commented.setup()
end
do
  local leap = require("leap")
  leap.add_default_mappings()
end
return vimg("python_highlight_builtins", 1)
