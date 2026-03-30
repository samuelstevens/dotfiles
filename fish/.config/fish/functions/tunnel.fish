function tunnel --description "Forwards a remote port to the local port"
    if test (count $argv) -lt 2
        echo "usage: tunnel HOST PORT [REMOTE_HOST]" >&2
        return 1
    end

    set --local host $argv[1]
    set --local port $argv[2]
    set --local remote_host (test (count $argv) -ge 3; and echo $argv[3]; or echo localhost)
    set --local forward_spec "$port:$remote_host:$port"

    if command -q lsof
        set --local listening_pid (lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null)
        if test -n "$listening_pid"
            set --local existing_cmd (ps -o command= -p $listening_pid 2>/dev/null | string trim)
            if string match -q -- "ssh* -L $forward_spec*" "$existing_cmd"
                echo "Tunnel already active: localhost:$port -> $remote_host:$port via $host"
                return 0
            end

            echo "Local port $port is already in use:" >&2
            lsof -nP -iTCP:$port -sTCP:LISTEN >&2
            return 1
        end
    end

    echo "Forwarding localhost:$port -> $remote_host:$port via $host"
    ssh $host -o ExitOnForwardFailure=yes -N -L $forward_spec
end
