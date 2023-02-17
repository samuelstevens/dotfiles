function whoowns
    ps -o user= -p $argv
end
