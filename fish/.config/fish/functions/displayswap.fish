function displayswap
    displayplacer list | tail -n 1 | sed 's/displayplacer //;s/id:\(.\{36\}\) res:\([0-9x]\{7,9\}\) \(.*\)id:\(.\{36\}\) res:\2/id:\4 res:\2 \3id:\1 res:\2/g' | xargs displayplacer
    osascript -e 'beep 3'
end
