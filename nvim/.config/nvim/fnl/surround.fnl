(fn surrounded [left text right]
  (.. left text right))

(fn insert-ch [str ch pos]
  (.. (string.sub str 1 (- pos 1)) ch (string.sub str pos)))

(fn exit-visual []
  (vim.api.nvim_feedkeys (vim.api.nvim_replace_termcodes "<esc>" true false true) "n" false))

(fn get-line [row]
  (. (vim.api.nvim_buf_get_lines 0 (- row 1) row true) 1))

(fn set-line [row line]
  (vim.api.nvim_buf_set_lines 0 (- row 1) row true [line]))

(fn pair-of [open]
  (if (= open "`")
      "`"
      (= open "<")
      ">"
      (= open "[")
      "]"
      (= open "(")
      ")"
      (= open "\"")
      "\""
      (= open "'")
      "'"
      (= open "{")
      "}"))

(fn v-surround []
  (let [open-ch (vim.fn.nr2char (vim.fn.getchar))
        close-ch (pair-of open-ch)]
    (if (not (= close-ch nil))
        (let [[_ start-row start-col _] (vim.fn.getpos "v")
              [_ end-row end-col _] (vim.fn.getpos ".")
              same-line (= end-row start-row)

              start-line (get-line start-row)
              end-line (if same-line 
                           start-line 
                           (get-line end-row))

              fixed-start (insert-ch start-line open-ch start-col)
              fixed-end (if same-line 
                             (insert-ch fixed-start close-ch (+ end-col 2))
                             (insert-ch end-line close-ch (+ end-col 1)))]
          (set-line start-row fixed-start)
          (set-line end-row fixed-end)))
    (exit-visual)))

(fn setup []
  (vim.api.nvim_set_keymap "x" "s" "" {:noremap true :callback v-surround}))


{:setup setup}
