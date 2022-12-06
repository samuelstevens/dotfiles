; Plugin helpers

(fn get-line [row]
  (. (vim.api.nvim_buf_get_lines 0 (- row 1) row true) 1))

(fn set-line [row line]
  (vim.api.nvim_buf_set_lines 0 (- row 1) row true [line]))

{:set-line set-line
 :get-line get-line}
