(local helpers (require :helpers))

(fn surrounded [left text right]
  (.. left text right))

(fn insert-ch [str ch pos]
  (.. (string.sub str 1 (- pos 1)) ch (string.sub str pos)))

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

              start-line (helpers.get-line start-row)
              end-line (if same-line 
                           start-line 
                           (helpers.get-line end-row))

              fixed-start (insert-ch start-line open-ch start-col)
              fixed-end (if same-line 
                             (insert-ch fixed-start close-ch (+ end-col 2))
                             (insert-ch end-line close-ch (+ end-col 1)))]
          (helpers.set-line start-row fixed-start)
          (helpers.set-line end-row fixed-end)))
    (helpers.exit-visual)))

(fn setup []
  (vim.api.nvim_set_keymap "x" "m" "" {:noremap true :callback v-surround}))

{:setup setup}
