function uv-tools --description "Declaratively manage uv tools from ~/.config/uv/tools.txt"
    set -l file ~/.config/uv/tools.txt
    set -l cmd $argv[1]
    or set cmd sync

    # non-empty, non-comment lines from tools.txt
    set -l specs (string trim < $file | string match --invert --regex '^(#|$)')
    or set -e specs

    switch $cmd
        case sync
            for spec in $specs
                echo "==> $spec"
                uv tool install --upgrade $spec
                or return
            end
        case list
            printf '%s\n' $specs
        case prune
            set -l wanted (string match --regex '^\S+' $specs)
            set -l installed (uv tool list --color never | string match --invert --regex '^(- |$)' | string match --regex '^\S+')
            for tool in $installed
                contains -- $tool $wanted
                or uv tool uninstall $tool
            end
        case '*'
            echo "usage: uv-tools [sync|list|prune]" >&2
            return 1
    end
end
