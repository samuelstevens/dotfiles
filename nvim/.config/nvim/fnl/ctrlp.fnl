; Make use of :FZF
(fn setup [fzf]
  (vim.opt.runtimepath:append fzf)
  (vim.api.nvim_set_keymap "n" "<c-p>" ":FZF<cr>" {:noremap true}))

{:setup setup}
