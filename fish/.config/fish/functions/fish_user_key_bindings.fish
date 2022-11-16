function fish_user_key_bindings
    for mode in insert default visual
        # Bind c-o to autocomplete.
        bind --mode $mode \co forward-char
    end
end

fzf_key_bindings
