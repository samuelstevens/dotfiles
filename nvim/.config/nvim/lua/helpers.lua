local function get_line(row)
  return (vim.api.nvim_buf_get_lines(0, (row - 1), row, true))[1]
end
local function set_line(row, line)
  return vim.api.nvim_buf_set_lines(0, (row - 1), row, true, {line})
end
local function exit_visual()
  return vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<esc>", true, false, true), "n", false)
end
return {["set-line"] = set_line, ["get-line"] = get_line, ["exit-visual"] = exit_visual}
