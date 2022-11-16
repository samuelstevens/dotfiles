function require --description "check that a program is installed."
    if test $(count $argv) -eq 0
        echo "Need at least one argument."
    end

    for cmd in $argv
        if not type -q $cmd
            echo "Program '$cmd' required, but not installed."
            return 1
        end
    end
end
