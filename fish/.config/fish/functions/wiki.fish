set WIKI_DIR $HOME/Documents/wiki

function wiki-usage
    echo "wiki 0.4.0"
    echo "Samuel Stevens <samuel.robert.stevens@gmail.com>"
    echo "A simple wiki."
    echo
    echo "USAGE:"
    echo "  wiki [COMMAND]"
    echo
    echo "The wiki is a flat directory with no hierarchy. Files contain tags starting with #. To find files, use 'find'."
    echo
    echo "COMMANDS"
    echo "  find WORD [WORD ...]  Find all files matching each of the words."
    echo "                        If there is only one matching file, opens it directly."
    echo "  new WORD [WORD ...]   Make a new file with the phrase."
    echo "  tags                  Show all # tags in your wiki with a count."
    echo "  recent                Show a list of the most recent articles edited."
end

function wiki-find
    if test -z $argv[1]
        set file (fd --type file --maxdepth 1 | fzf)
    else
        # Find all files in the wiki directory
        set files (fd . -0 | string split0 | string replace "./" "") 

        for pattern in $argv
            # Filter files that don't have a match for the arguments in find
            set files (rg $pattern $files --files-with-matches | sort | uniq)
            # If we're out of files, break early
            if test (count $files) -eq 0
                break
            end
        end

        if test (count $files) -eq 0
            echo "No files found matching $argv"
            return 1
        else if test (count $files) -eq 1
            set file $files[1]
        else 
            set file (string split ' ' $files | sort --reverse | fzf)
        end
    end

    echo $file

    if test -z $file 
        echo "No file selected!"
        return 1
    else
        wiki-start $file
    end
end

function wiki-new
    set filename (string join "-" $argv | string lower).md

    if test -f $filename
        echo "File $filename already exists!"
        echo "Do you want to overwrite it? y/[n]:"
        read -n 1 choice
        if test $choice = "n" 
            or test -z $choice
            echo "Not overwriting!"
            return 0
        end
    end

    set title (string join " " $argv)
    echo $title > $filename
    wiki-start $filename
end

function wiki-recent
    set file (ls -t | head | fzf)
    wiki-start $file
end

function wiki-tags
    set tag_regex "(?:^|\s+)#(\w|/|-|_)+"

    rg --max-depth 1 --no-line-number --no-filename --only-matching $tag_regex \
        | string trim \
        | string trim --chars '#' \
        | string lower \
        | sort \
        | uniq -c \
        | less
end

function wiki-start
    if test -z $argv[1] 
        $EDITOR
    else if test (string sub --start -2 $argv[1]) = "md"
        $EDITOR $argv[1]
    else
        open $argv[1]
    end
end

function wiki 
    set cmd $argv[1]
    set options $argv[2..]

    mkdir -p $WIKI_DIR
    pushd $WIKI_DIR

    require rg
    require fd
    require fzf

    switch $cmd
        case start
            wiki-start $options
        case find
            wiki-find $options
        case new
            wiki-new $options
        case tags
            wiki-tags $options
        case recent
            wiki-recent $options
        case '*'
            wiki-usage $options
    end

    popd
end
