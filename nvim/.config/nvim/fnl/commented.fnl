; Makes it easy to comment lines in various languages using gc and gcc
(local helpers (require :lua.helpers))

(fn commented [line prefix]
  ; Insert the prefix right before the first non-whitespace character.
  (string.gsub line (.. "^(%s*)") (.. "%1" prefix)))

(fn uncommented [line prefix]
  ; Remove the prefix (if any) that comes after all whitespace characters.
  (line:gsub (.. "^(%s*)" prefix) "%1" 1))

(fn commented? [line prefix]
  ; prefix is the comment prefix, like // or #
  ; checks if the first non-whitespace characters are the prefix
  (line:match (.. "^%s*" prefix)))

(fn get-prefix []
  (let [ft vim.bo.filetype]
    (if (= ft "make")
        "# "
        (= ft "python")
        "# "
        (= ft "fennel")
        "; "
        (= ft "c")
        "// "
        (= ft "lua")
        "-- "
        ; Use // as generic comment prefix
        "// ")))

(fn line-comment-toggle []
  (let [[_ row _ _] (vim.fn.getpos ".")
        line (helpers.get-line row)
        prefix (get-prefix)]
    (if (commented? line prefix)
        (helpers.set-line row (uncommented line prefix))
        (helpers.set-line row (commented line prefix)))))

(fn setup []
  (vim.api.nvim_set_keymap "x" "gc" "" {:noremap true :callback v-comment-toggle})
  (vim.api.nvim_set_keymap "n" "gcc" "" {:noremap true :callback line-comment-toggle}))


{:setup setup}
