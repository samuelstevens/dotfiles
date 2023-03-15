; Makes it easy to comment lines in various languages using gc and gcc
(local helpers (require :helpers))
(local core (require :core))

(fn escape [prefix]
  ; Replace any magic characters with their escaped versions
  (string.gsub prefix "([%^%$%(%)%%%.%[%]%*%+%-%?])" "%%%1"))

(fn get-prefix [filetype]
    (if (= filetype "make")
        "# "
        (= filetype "python")
        "# "
        (= filetype "toml")
        "# "
        (= filetype "fennel")
        "; "
        (= filetype "c")
        "// "
        (= filetype "elm")
        "-- "
        (= filetype "lua")
        "-- "
        (= filetype "sql")
        "-- "
        (= filetype "tex")
        "% "
        ; Use // as generic comment prefix
        "// "))

(fn commented [line prefix]
  ; Insert the prefix right before the first non-whitespace character.
  (string.gsub line (.. "^(%s*)") (.. "%1" (escape prefix))))

(fn uncommented [line prefix]
  ; Remove the prefix (if any) that comes after all whitespace characters.
  (line:gsub (.. "^(%s*)" (escape prefix)) "%1" 1))

(fn commented? [line prefix]
  ; prefix is the comment prefix, like // or #
  ; checks if the first non-whitespace characters are the prefix
  (core.->bool (line:match (.. "^%s*" (escape prefix)))))

(fn line-comment-toggle []
  (let [[_ row _ _] (vim.fn.getpos ".")
        line (helpers.get-line row)
        prefix (get-prefix vim.bo.filetype)]
    (if (commented? line prefix)
        (helpers.set-line row (uncommented line prefix))
        (helpers.set-line row (commented line prefix)))))

(fn toggle-lines [rows] 
  ; Toggles comments on all lines in rows
  ; rows is a list of integers
  ; lines is a lookup from row to raw line strings
  (let [lines (collect [_ row (ipairs rows)]
                (values row (helpers.get-line row)))
        prefix (get-prefix vim.bo.filetype)
        func (if (core.all (icollect [_ line (pairs lines)]
                             (commented? line prefix)))
                 uncommented
                 commented)]
    (each [row line (pairs lines)]
      (helpers.set-line row (func line prefix)))))

(fn v-comment-toggle []
  ; Toggles comments on all lines that are visually selected.
  ; If at least one line is uncommented, then comment them all
  ; If all lines are commented, uncomment them all.
  (let [[_ start _ _] (vim.fn.getpos "v")
        [_ end _ _] (vim.fn.getpos ".")]
    (if (< start end)
        (toggle-lines (core.range start end))
        (toggle-lines (core.range end start))))
  (helpers.exit-visual))

(fn setup []
  (vim.api.nvim_set_keymap "x" "gc" "" {:noremap true :callback v-comment-toggle})
  (vim.api.nvim_set_keymap "n" "gcc" "" {:noremap true :callback line-comment-toggle}))

{:setup setup}
