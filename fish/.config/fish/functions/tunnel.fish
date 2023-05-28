function tunnel --description "Forwards a remote port to the local port"
    set --local host $argv[1]
    set --local port $argv[2]
    echo "Forwarding $host:$port to localhost:$port"
    ssh $host -N -L $port:localhost:$port
end
