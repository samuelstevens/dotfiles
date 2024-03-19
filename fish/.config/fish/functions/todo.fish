set TODO_DIR $HOME/.local/state/todo
set TODAY $TODO_DIR/(date +%Y-%m-%d).md
set YESTERDAY $TODO_DIR/(date -v -1d +%Y-%m-%d).md
set TOMORROW $TODO_DIR/(date -v +1d +%Y-%m-%d).md

function usage
    echo "todo 0.5.0"
    echo "Samuel Stevens <samuel.robert.stevens@gmail.com>"
    echo "A simple todo manager."
    echo
    echo "USAGE:"
    echo "  todo [command]"
    echo
    echo "  Calling todo without any command will open today's todo file. If it is the first time you have started todo today, it will use yesterday's todo file as a template."
    echo
    echo "COMMANDS:"
    echo "  find PATTERN  Find PATTERN in $TODO_DIR."
    echo "  ls            Show all note files in $TODO_DIR"
    echo "  open          Open $EDITOR in $TODO_DIR."
    echo
    echo "  yesterday     Open the todo file for yesterday."
    echo "  today         Open the todo file for today."
    echo "  tomorrow      Open the todo file for tomorrow."
end

function todo_today
    if test -f $YESTERDAY
        if ! test -f $TODAY
            cp $YESTERDAY $TODAY
        end
    end
    $EDITOR $TODAY
end

function todo_yesterday
    $EDITOR $YESTERDAY
end

function todo_tomorrow
    if test -f $TODAY
        if ! test -f $TOMORROW
            cp $TODAY $TOMORROW
        end
    end
    $EDITOR $TOMORROW
end

function todo_ls
    ls $TODO_DIR
end

function todo_open
    $EDITOR $TODO_DIR
end

function todo_find 
    echo "Not implemented."
end

function todo
    mkdir -p $TODO_DIR
    pushd $TODO_DIR

    if ! string length -q -- $argv
        todo_today
    else
        switch $argv[1]
            case ls
                todo_ls
            case find
                todo_find
            case open
                todo_open
            case today
                todo_today
            case yesterday
                todo_yesterday
            case tomorrow
                todo_tomorrow
            case '*'
                usage
        end            
    end

    popd
end
