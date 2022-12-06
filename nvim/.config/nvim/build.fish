function compile
    fennel --compile --require-as-include $argv[1] > $argv[2]
end


compile fnl/functions.fnl lua/functions.lua
compile fnl/helpers.fnl lua/helpers.lua

compile fnl/surround.fnl lua/surround.lua
compile fnl/ctrlp.fnl lua/ctrlp.lua
compile fnl/commented.fnl lua/commented.lua

fennel --compile init.fnl > init.lua
