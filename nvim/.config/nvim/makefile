init.lua: init.fnl
	fennel --compile init.fnl > init.lua

lua/%.lua: fnl/%.fnl
	fennel --compile $< > $@
