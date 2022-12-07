local function all(args)
  local a = true
  for _, value in ipairs(args) do
    do local _ = not a end
    a = (a and value)
  end
  return a
end
local function range(low, high)
  local tbl_17_auto = {}
  local i_18_auto = #tbl_17_auto
  for i = low, high do
    local val_19_auto = i
    if (nil ~= val_19_auto) then
      i_18_auto = (i_18_auto + 1)
      do end (tbl_17_auto)[i_18_auto] = val_19_auto
    else
    end
  end
  return tbl_17_auto
end
local function debug(exp)
  vim.pretty_print(exp)
  return exp
end
local function __3ebool(a)
  if a then
    return true
  else
    return false
  end
end
return {range = range, all = all, debug = debug, ["->bool"] = __3ebool}
