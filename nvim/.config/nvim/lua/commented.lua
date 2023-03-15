local helpers = require("helpers")
local core = require("core")
local function escape(prefix)
  return string.gsub(prefix, "([%^%$%(%)%%%.%[%]%*%+%-%?])", "%%%1")
end
local function get_prefix(filetype)
  if (filetype == "make") then
    return "# "
  elseif (filetype == "python") then
    return "# "
  elseif (filetype == "toml") then
    return "# "
  elseif (filetype == "fennel") then
    return "; "
  elseif (filetype == "c") then
    return "// "
  elseif (filetype == "elm") then
    return "-- "
  elseif (filetype == "lua") then
    return "-- "
  elseif (filetype == "sql") then
    return "-- "
  elseif (filetype == "tex") then
    return "% "
  else
    return "// "
  end
end
local function commented(line, prefix)
  return string.gsub(line, "^(%s*)", ("%1" .. escape(prefix)))
end
local function uncommented(line, prefix)
  return line:gsub(("^(%s*)" .. escape(prefix)), "%1", 1)
end
local function commented_3f(line, prefix)
  return core["->bool"](line:match(("^%s*" .. escape(prefix))))
end
local function line_comment_toggle()
  local _let_2_ = vim.fn.getpos(".")
  local _ = _let_2_[1]
  local row = _let_2_[2]
  local _0 = _let_2_[3]
  local _1 = _let_2_[4]
  local line = helpers["get-line"](row)
  local prefix = get_prefix(vim.bo.filetype)
  if commented_3f(line, prefix) then
    return helpers["set-line"](row, uncommented(line, prefix))
  else
    return helpers["set-line"](row, commented(line, prefix))
  end
end
local function toggle_lines(rows)
  local lines
  do
    local tbl_14_auto = {}
    for _, row in ipairs(rows) do
      local k_15_auto, v_16_auto = row, helpers["get-line"](row)
      if ((k_15_auto ~= nil) and (v_16_auto ~= nil)) then
        tbl_14_auto[k_15_auto] = v_16_auto
      else
      end
    end
    lines = tbl_14_auto
  end
  local prefix = get_prefix(vim.bo.filetype)
  local func
  local function _5_()
    local tbl_17_auto = {}
    local i_18_auto = #tbl_17_auto
    for _, line in pairs(lines) do
      local val_19_auto = commented_3f(line, prefix)
      if (nil ~= val_19_auto) then
        i_18_auto = (i_18_auto + 1)
        do end (tbl_17_auto)[i_18_auto] = val_19_auto
      else
      end
    end
    return tbl_17_auto
  end
  if core.all(_5_()) then
    func = uncommented
  else
    func = commented
  end
  for row, line in pairs(lines) do
    helpers["set-line"](row, func(line, prefix))
  end
  return nil
end
local function v_comment_toggle()
  do
    local _let_8_ = vim.fn.getpos("v")
    local _ = _let_8_[1]
    local start = _let_8_[2]
    local _0 = _let_8_[3]
    local _1 = _let_8_[4]
    local _let_9_ = vim.fn.getpos(".")
    local _2 = _let_9_[1]
    local _end = _let_9_[2]
    local _3 = _let_9_[3]
    local _4 = _let_9_[4]
    if (start < _end) then
      toggle_lines(core.range(start, _end))
    else
      toggle_lines(core.range(_end, start))
    end
  end
  return helpers["exit-visual"]()
end
local function setup()
  vim.api.nvim_set_keymap("x", "gc", "", {noremap = true, callback = v_comment_toggle})
  return vim.api.nvim_set_keymap("n", "gcc", "", {noremap = true, callback = line_comment_toggle})
end
return {setup = setup}
