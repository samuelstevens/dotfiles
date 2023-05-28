function tmuxa
    set --local session (tmux ls | fzf | cut -d : -f 1)
    echo Attaching to $session
    tmux attach -t $session
end
