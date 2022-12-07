; Super generic core fennel functions

(fn all [args]
  ; Checks that all values in args are truthy
  (var a true)
  (each [_ value (ipairs args)] &until (not a)
    (set a (and a value)))
  a)

(fn range [low high]
  (fcollect [i low high] i))

(fn debug [exp]
  (vim.pretty_print exp)
  exp)

(fn ->bool [a]
  (if a true false))

{:range range :all all :debug debug :->bool ->bool}
