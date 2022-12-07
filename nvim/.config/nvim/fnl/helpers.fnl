; Plugin helpers

(fn get-line [row]
  (. (vim.api.nvim_buf_get_lines 0 (- row 1) row true) 1))

(fn set-line [row line]
  (vim.api.nvim_buf_set_lines 0 (- row 1) row true [line]))

(fn exit-visual []
  (vim.api.nvim_feedkeys (vim.api.nvim_replace_termcodes "<esc>" true false true) "n" false))

{:set-line set-line :get-line get-line :exit-visual exit-visual}
