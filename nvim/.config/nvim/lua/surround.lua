local function surrounded(left, text, right)
  return (left .. text .. right)
end
local function insert_ch(str, ch, pos)
  return (string.sub(str, 1, (pos - 1)) .. ch .. string.sub(str, pos))
end
local function exit_visual()
  return vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<esc>", true, false, true), "n", false)
end
local function pair_of(open)
  if (open == "`") then
    return "`"
  elseif (open == "<") then
    return ">"
  elseif (open == "[") then
    return "]"
  elseif (open == "(") then
    return ")"
  elseif (open == "\"") then
    return "\""
  elseif (open == "'") then
    return "'"
  elseif (open == "{") then
    return "}"
  else
    return nil
  end
end
local function v_surround()
  local open_ch = vim.fn.nr2char(vim.fn.getchar())
  local close_ch = pair_of(open_ch)
  if not (close_ch == nil) then
    local _let_2_ = vim.fn.getpos("v")
    local _ = _let_2_[1]
    local start_row = _let_2_[2]
    local start_col = _let_2_[3]
    local _0 = _let_2_[4]
    local _let_3_ = vim.fn.getpos(".")
    local _1 = _let_3_[1]
    local end_row = _let_3_[2]
    local end_col = _let_3_[3]
    local _2 = _let_3_[4]
    local same_line = (end_row == start_row)
    local start_line = __fnl_global__get_2dline(start_row)
    local end_line
    if same_line then
      end_line = start_line
    else
      end_line = __fnl_global__get_2dline(end_row)
    end
    local fixed_start = insert_ch(start_line, open_ch, start_col)
    local fixed_end
    if same_line then
      fixed_end = insert_ch(fixed_start, close_ch, (end_col + 2))
    else
      fixed_end = insert_ch(end_line, close_ch, (end_col + 1))
    end
    __fnl_global__set_2dline(start_row, fixed_start)
    __fnl_global__set_2dline(end_row, fixed_end)
  else
  end
  return exit_visual()
end
local function setup()
  return vim.api.nvim_set_keymap("x", "s", "", {noremap = true, callback = v_surround})
end
return {setup = setup}
