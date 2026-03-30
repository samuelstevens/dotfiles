function venv --description "Activate ./.venv for the current project"
    set -l activate_path .venv/bin/activate.fish

    if not test -f $activate_path
        echo "venv: no $activate_path in "(pwd) >&2
        return 1
    end

    source $activate_path
end
