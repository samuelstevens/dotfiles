function whoowns --wraps='ps -o user= -p ' --description 'alias whoowns=ps -o user= -p '
  ps -o user= -p  $argv
        
end
