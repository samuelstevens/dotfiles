local function setup(fzf)
  do end (vim.opt.runtimepath):append(fzf)
  return vim.api.nvim_set_keymap("n", "<c-p>", ":FZF<cr>", {noremap = true})
end
return {setup = setup}
