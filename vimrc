" themes
set background=light
colorscheme solarized

" This enables relative line numbering mode. With both number and
" relativenumber enabled, the current line shows the true line number, while
" all other lines (above and below) are numbered relative to the current line.
" This is useful because you can tell, at a glance, what count is needed to
" jump up or down to a particular line, by {count}k to go up or {count}j to go
" down.
set relativenumber

" Always show the status line at the bottom, even if you only have one window open.
set laststatus=2

" By default, Vim doesn't let you hide a buffer (i.e. have a buffer that isn't
" shown in any window) that has unsaved changes. This is to prevent you from "
" forgetting about unsaved changes and then quitting e.g. via `:qa!`. We find
" hidden buffers helpful enough to disable this protection. See `:help hidden`
" for more information on this.
set hidden

" Unbind some useless/annoying default key bindings.
nmap Q <Nop> " 'Q' in normal mode enters Ex mode. You almost never want this.

" Try to prevent bad habits like using the arrow keys for movement. This is
" not the only possible bad habit. For example, holding down the h/j/k/l keys
" for movement, rather than using more efficient movement commands, is also a
" bad habit. The former is enforceable through a .vimrc, while we don't know
" how to prevent the latter.
" Do this in normal mode...
nnoremap <Left>  :echoe "Use h"<CR>
nnoremap <Right> :echoe "Use l"<CR>
nnoremap <Up>    :echoe "Use k"<CR>
nnoremap <Down>  :echoe "Use j"<CR>
" ...and in insert mode
inoremap <Left>  <ESC>:echoe "Use h"<CR>
inoremap <Right> <ESC>:echoe "Use l"<CR>
inoremap <Up>    <ESC>:echoe "Use k"<CR>
inoremap <Down>  <ESC>:echoe "Use j"<CR>

" performance issues
set timeoutlen=1000
set ttimeoutlen=50

" region generic niceties

set number " show line numbers
set showcmd " show command in bottom bar
set cursorline " highlight the current line
syntax enable " enable syntax highlighting
set autoindent " new lines respect current indent

" word wrap, but only at word boundaries
set wrap
set linebreak

" make filetypes work
filetype on
filetype indent on
filetype plugin on

set tabstop=2		" number of visual spaces per TAB
set softtabstop=2	" number of spaces to insert for a TAB when editing
set expandtab		" causes TAB to be inserted as spaces
set shiftwidth=2 " when indenting with '<', use 2 spaces.

" Vim is based on Vi. Setting `nocompatible` switches from the default
" Vi-compatibility mode and enables useful Vim functionality. This
" configuration option turns out not to be necessary for the file named
" '~/.vimrc', because Vim automatically enters nocompatible mode if that file
" is present. But we're including it here just in case this config file is
" loaded some other way (e.g. saved as `foo`, and then Vim started with
" `vim -u foo`).
set nocompatible

" The backspace key has slightly unintuitive behavior by default. For example,
" by default, you can't backspace before the insertion point set with 'i'.
" This configuration makes backspace behave more reasonably, in that you can
" backspace over anything.
set backspace=indent,eol,start

set shortmess+=a " Disable the default Vim startup message.

set wildmenu " enhanced command-line completion
set wildmode=list:longest

" Use CTRL-J and CTRL-K to navigate the autocompletel menu
inoremap <C-j> <C-n>
inoremap <C-k> <C-p>

" endregion

" region shortcuts

" leader
let mapleader = "\<space>"
let maplocalleader = "\<space>"

" I don't like being in insert mode after o/O
nnoremap o o<esc>
nnoremap O O<esc>

" quick editing of vimrc
nnoremap <leader>ev :e $MYVIMRC<CR>
nnoremap <leader>sv :source $MYVIMRC<CR>

" CTRL-<any number> doesn't work on my terminal, and I'm too lazy to
" understand why.
nnoremap <C-e> <C-^>

" common typos
iabbrev adn and
iabbrev waht what
iabbrev tehn then

" expansions
iabbrev @@ samuel.robert.stevens@gmail.com

" endregion shortcuts

" region navigation

" jumping between brackets
nnoremap <C-S> %
vnoremap <C-S> %

" window splits
set splitbelow
set splitright

" window navigation
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>

" buffer navigation
nnoremap <leader>bn :bnext<CR>
nnoremap <leader>bp :bprevious<CR>
nnoremap <leader>bd :bdelete<CR>
nnoremap <leader>ls :buffers<CR>:buffer<Space>

" endregion navigation

" region plugins

call plug#begin('~/.vim/plugins')

" general plugins
Plug 'easymotion/vim-easymotion'
Plug 'tmux-plugins/vim-tmux-focus-events'
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'tpope/vim-commentary'
Plug 'mileszs/ack.vim'
Plug 'tpope/vim-unimpaired'

" syntax
Plug 'vim-python/python-syntax'
Plug 'cespare/vim-toml'

" IDE stuff
Plug 'prabirshrestha/vim-lsp'
Plug 'mattn/vim-lsp-settings'
Plug 'prabirshrestha/asyncomplete.vim'
Plug 'prabirshrestha/asyncomplete-lsp.vim'
Plug 'psf/black'
Plug 'prettier/vim-prettier', { 'do': 'npm install' }

call plug#end()

" Prettier
let g:prettier#config#trailing_comma = 'all'

" fzf
if executable('rg')
  nnoremap <C-p> :call fzf#run(fzf#wrap({'source': 'rg --files'}))<CR>
else
  nnoremap <C-p> :FZF<CR>
endif

" endregion plugins

" region language servers (lsp)

let g:lsp_signs_enabled = 1
let g:lsp_signature_help_enabled=0
let g:lsp_diagnostics_echo_cursor = 1
let g:lsp_diagnostics_float_cursor = 1
let g:lsp_diagnostics_float_delay = 1000

nnoremap gd :LspDefinition<CR>
nnoremap gr :LspReferences<CR>
nnoremap K :LspHover<CR>
nnoremap [g :LspPreviousDiagnostic<CR>
nnoremap ]g :LspNextDiagnostic<CR>
nnoremap <leader>f :LspDocumentFormat<CR>:write<CR>

" endregion language servers

" region searching

" This setting makes search case-insensitive when all characters in the string
" being searched are lowercase. However, the search becomes case-sensitive if
" it contains any capital letters. This makes searching more convenient. (MIT
" CSAIL)
set ignorecase
set smartcase

set gdefault " applies /g by default

set hlsearch " highlight search results
set incsearch " show search results as you type
" turn off search highlighting quickly
nnoremap <leader><CR> :nohlsearch<CR>

" configure ripgrep appropriately
let g:ackprg = 'rg --vimgrep --smart-case'

" close quickfix window after selecting a match
let g:ack_autoclose = 1

" use current work if no pattern (find other uses)
let g:ack_use_cword_for_empty_search = 1

nnoremap <leader>/ :Ack!<space>

" endregion

" region filetypes

let g:tex_flavor = "latex" " always use latex for .tex files

augroup filetype_javascript
  autocmd!

  " use Prettier for formatting
  autocmd FileType javascript nnoremap <buffer> <localleader>f :Prettier<CR>
augroup END

augroup filetype_python
  autocmd!

  " makes python files use 4 spaces
  autocmd FileType python setlocal tabstop=4 shiftwidth=4 softtabstop=4

  " use BLACK for formatting
  autocmd FileType python nnoremap <buffer> <localleader>f :Black<CR>

  " show a column at 88 chars for formatting
  autocmd FileType python set colorcolumn=88
augroup END

augroup filetype_c
  autocmd!

  " 4 spaces for tabs
  autocmd FileType c setlocal tabstop=4 shiftwidth=4 softtabstop=4
  autocmd FileType cpp setlocal tabstop=4 shiftwidth=4 softtabstop=4
augroup END

augroup filetype_elm
  autocmd!

  " 4 spaces for tabs
  autocmd FileType elm setlocal tabstop=4 shiftwidth=4 softtabstop=4
augroup END

augroup filetype_sh
  " insert shebang automagically
  autocmd BufNewFile *.sh 0:read ~/.vim/skeletons/sh | $
augroup END

augroup filetype_tex
  " insert shebang automagically
  autocmd BufNewFile *.tex 0:read ~/.vim/skeletons/tex | $
augroup END

augroup filetype_java
  autocmd!

  " makes java files use 4 spaces
  autocmd FileType java setlocal tabstop=4 shiftwidth=4 softtabstop=4
augroup END

augroup filetype_cup
  autocmd!

  " syntax
  autocmd BufRead,BufNewFile *.cup set filetype=cup
  autocmd FileType cup set filetype=java
augroup END

augroup filetype_jflex
  autocmd!

  " syntax
  autocmd BufRead,BufNewFile *.jflex set filetype=jflex
  autocmd FileType jflex set filetype=java
augroup END

augroup filetype_racket
  autocmd!

  " syntax
  autocmd BufReadPost *.rkt,*.rktl set filetype=scheme

  " lispy stuff
  autocmd filetype racket set lisp
  autocmd filetype racket set autoindent
  autocmd filetype racket unmap gd
augroup END
" endregion filetypes

" region statusline :)

set statusline=%f " path to the file
set statusline+=\ -\  " separator
set statusline+=%y " filetype
set statusline+=%= " switch to right side
set statusline+=line\ %l " current line
set statusline+=\ of\  " separator
set statusline+=%L " total lines

" endregion statuslines

" region autocommands

au FocusGained,BufEnter * :checktime

" endregion autocommands

" region folding

set foldmethod=marker
set foldmarker=region,endregion

" endregion
