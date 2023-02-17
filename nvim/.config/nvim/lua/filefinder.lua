local function setup(fzf, keymap)
  do end (vim.opt.runtimepath):append(fzf)
  return vim.api.nvim_set_keymap("n", keymap, ":FZF<cr>", {noremap = true})
end
return {setup = setup}
