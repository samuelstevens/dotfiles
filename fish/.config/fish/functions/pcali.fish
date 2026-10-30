function pcali --description "Translate PlusCal in place: keep the .tla file (no .old rename) and the .cfg"
    # pcal renames the .tla to .old, writes a new .tla, and overwrites the .cfg. Translate a copy instead, then write the result into the original file, so editors keep the same file open.
    set -l f (realpath $argv[-1])
    set -l tmp (mktemp -d)
    cp $f $tmp/
    pushd $tmp
    pcal -nocfg $argv[1..-2] (basename $f)
    set -l st $status
    popd
    if test $st -eq 0
        cat $tmp/(basename $f) >$f
    end
    rm -rf $tmp
    return $st
end
