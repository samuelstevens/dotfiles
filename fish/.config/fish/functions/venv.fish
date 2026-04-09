function venv --description "Activate .venv for the current project"
    set -l dir (pwd)
    set -l activate_path "$dir/.venv/bin/activate.fish"

    # Always allow a .venv in the current directory.
    if test -f $activate_path
        source $activate_path
        return 0
    end

    while true
        if test -f "$dir/.venv/bin/activate.fish"; and test -e "$dir/.git"
            source "$dir/.venv/bin/activate.fish"
            return 0
        end

        if test "$dir" = /
            break
        end

        set dir (path dirname $dir)
    end

    echo "venv: no local .venv and no parent .venv at a git root from "(pwd) >&2
    return 1
end
