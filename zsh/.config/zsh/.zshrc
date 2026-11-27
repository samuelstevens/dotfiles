# In Rex terminals, start fish instead of zsh.
if [[ -o interactive && $TERM_PROGRAM == rex && -x ~/.local/bin/fish ]]; then
  exec ~/.local/bin/fish
fi
