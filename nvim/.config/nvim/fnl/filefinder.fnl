; Make use of :FZF
(fn setup [fzf keymap]
  (vim.opt.runtimepath:append fzf)
  (vim.api.nvim_set_keymap "n" keymap ":FZF<cr>" {:noremap true}))

{:setup setup}
