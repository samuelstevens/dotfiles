local function add_file_suffix()
  local ext = ("." .. vim.fn.expand("%:e"))
  if ((vim.bo.suffixesadd == nil) or (vim.bo.suffixesadd == "")) then
    vim.bo["suffixesadd"] = ext
    return nil
  elseif not (vim.bo.suffixesadd):match(ext) then
    vim.bo["suffixesadd"] = (vim.bo.suffixesadd .. "," .. ext)
    return nil
  else
    return nil
  end
end
local function create_augroup(autocmds, name)
  vim.cmd(("augroup filetype_" .. name))
  vim.cmd("autocmd!")
  for _, autocmd in ipairs(autocmds) do
    vim.cmd(("autocmd " .. table.concat(autocmd, " ")))
  end
  return vim.cmd("augroup END")
end
return {["add-file-suffix"] = add_file_suffix, ["create-augroup"] = create_augroup}
