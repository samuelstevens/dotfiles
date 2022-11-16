(fn add-file-suffix []
  ; Adds the current file's extension to suffixesadd so 
  ; you can go to other files with the same extension.
  (let [ext (.. "." (vim.fn.expand "%:e"))]
    (if (or (= vim.bo.suffixesadd nil) (= vim.bo.suffixesadd ""))
        (tset vim.bo :suffixesadd ext)
        (not (vim.bo.suffixesadd:match ext))
        (tset vim.bo :suffixesadd (.. vim.bo.suffixesadd "," ext)))))

(fn create-augroup [autocmds name]
  (vim.cmd (.. "augroup filetype_" name))
  (vim.cmd "autocmd!")
  (each [_ autocmd (ipairs autocmds)]
    (vim.cmd (.. "autocmd " (table.concat autocmd " "))))
  (vim.cmd "augroup END"))

{:add-file-suffix add-file-suffix
 :create-augroup create-augroup}
