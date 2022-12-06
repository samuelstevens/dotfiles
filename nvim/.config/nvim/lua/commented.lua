local helpers
package.preload["lua.helpers"] = package.preload["lua.helpers"] or function(...)
  local function get_line(row)
    return (vim.api.nvim_buf_get_lines(0, (row - 1), row, true))[1]
  end
  local function set_line(row, line)
    return vim.api.nvim_buf_set_lines(0, (row - 1), row, true, {line})
  end
  return {["set-line"] = set_line, ["get-line"] = get_line}
end
helpers = require("lua.helpers")
local function commented(line, prefix)
  return string.gsub(line, "^(%s*)", ("%1" .. prefix))
end
local function uncommented(line, prefix)
  return line:gsub(("^(%s*)" .. prefix), "%1", 1)
end
local function commented_3f(line, prefix)
  return line:match(("^%s*" .. prefix))
end
local function get_prefix()
  local ft = vim.bo.filetype
  if (ft == "make") then
    return "# "
  elseif (ft == "python") then
    return "# "
  elseif (ft == "fennel") then
    return "; "
  elseif (ft == "c") then
    return "// "
  elseif (ft == "lua") then
    return "-- "
  else
    return "// "
  end
end
local function line_comment_toggle()
  local _let_2_ = vim.fn.getpos(".")
  local _ = _let_2_[1]
  local row = _let_2_[2]
  local _0 = _let_2_[3]
  local _1 = _let_2_[4]
  local line = helpers["get-line"](row)
  local prefix = get_prefix()
  if commented_3f(line, prefix) then
    return helpers["set-line"](row, uncommented(line, prefix))
  else
    return helpers["set-line"](row, commented(line, prefix))
  end
end
local function setup()
  vim.api.nvim_set_keymap("x", "gc", "", {noremap = true, callback = __fnl_global__v_2dcomment_2dtoggle})
  return vim.api.nvim_set_keymap("n", "gcc", "", {noremap = true, callback = line_comment_toggle})
end
return {setup = setup}
