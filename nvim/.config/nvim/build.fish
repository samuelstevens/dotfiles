function compile
    fennel --compile $argv[1] > $argv[2]
end

compile fnl/functions.fnl lua/functions.lua
compile fnl/helpers.fnl lua/helpers.lua
compile fnl/core.fnl lua/core.lua

compile fnl/surround.fnl lua/surround.lua
compile fnl/filefinder.fnl lua/filefinder.lua
compile fnl/commented.fnl lua/commented.lua

compile init.fnl init.lua
