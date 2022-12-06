local function get_line(row)
  return (vim.api.nvim_buf_get_lines(0, (row - 1), row, true))[1]
end
local function set_line(row, line)
  return vim.api.nvim_buf_set_lines(0, (row - 1), row, true, {line})
end
return {["set-line"] = set_line, ["get-line"] = get_line}
