function pulsefix
    sudo launchctl unload -w /Library/LaunchDaemons/net.pulsesecure.AccessService.plist
    sudo launchctl load -w /Library/LaunchDaemons/net.pulsesecure.AccessService.plist
end
