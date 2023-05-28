function total
    set --local numbers
    while read line
        set numbers $numbers (string split ' ' $line)
    end
    string join " + " $numbers | bc
end
