(fn vimopt [opts]
  (each [key value (pairs opts)]
    (tset vim.opt key value)))

(fn vimg [key value]
  (tset vim.g key value))

(fn cmd [str]
  (vim.cmd str))

(fn iabbrev [wrong right]
  (cmd (.. "iabbrev" " " wrong " " right)))

; Generic options that are broadly useful
(vimopt 
  {
   :number true
   :background "light"
   :autoindent true
   :autoread true
   :cursorline true
   :hidden true
   :laststatus 2
   :modelines 0
   :swapfile false
   :scrolloff 2
   :showcmd true
   :mouse ""
   ; Word wrap
   :wrap true
   :linebreak true
   ; Searching
   :ignorecase true
   :smartcase true
   :gdefault true
   :hlsearch true
   :incsearch true
   ; Tabs
   :tabstop 2
   :softtabstop 2
   :expandtab true
   :shiftwidth 2
   })


(cmd "syntax enable")
(cmd "colorscheme solarized")
(cmd "hi Comment cterm=bold ctermfg=240")

(iabbrev "tehn" "then")
(iabbrev "waht" "what")

(vimg :mapleader " ")
(let [venv (.. vim.env.HOME "/.local/venv/nvim")]
  (vimg :python3_host_prog (.. venv "/bin/python")))
(vimg :netrw_banner 0)
(vimg :netrw_keepdir 0)

; Search
(if (vim.fn.executable "rg")
    (vimopt {:grepprg "rg --vimgrep $*" :grepformat "%f:%l:%c:%m"}))
(vim.api.nvim_set_keymap "n" "<leader>/" ":grep " {:noremap true})

; Keymaps
(vim.api.nvim_set_keymap "n" "o" "o<esc>" {:noremap true})
(vim.api.nvim_set_keymap "n" "O" "O<esc>" {:noremap true})
; Switch to recent file
(vim.api.nvim_set_keymap "n" "<c-e>" "<c-^>" {:noremap true})
; Disable highlights
(vim.api.nvim_set_keymap "n" "<leader><cr>" ":nohlsearch<CR>" {:noremap true})
; Open links in parentheses
(vim.api.nvim_set_keymap "n" "gp" "vi(gx" {:noremap false})
; Match some helix settings that I like a lot.
(vim.keymap.set "" "ge" "G")
(vim.keymap.set "" "gh" "0")
(vim.keymap.set "" "gl" "$")
(vim.keymap.set "" "ga" "<c-^>")

; Make - open the directory explorer
(vim.api.nvim_set_keymap "n" "-" ":edit .<cr>" {:noremap false})

; Autocommands
(let [functions (require :functions)]
  (vim.api.nvim_create_autocmd
    "BufEnter"
    {:pattern "*"
     :callback (fn [ev] (functions.add-file-suffix))}))



; Plugins
(let [filefinder (require :filefinder)]
  (filefinder.setup "~/.fzf" "<leader>f"))

(let [surround (require :surround)]
  (surround.setup))

(let [commented (require :commented)]
  (commented.setup))

(let [leap (require :leap)]
  (leap.add_default_mappings))
