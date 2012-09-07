
// javascript expansion
//   > echo `Math.pow(2, 32)`

shell.on('command', function(e){
  e.line = expansion(e.line);
});

function expansion(line) {
  return line.replace(/`(.*?)`/, function(_, js){
    return eval('(' + js + ')');
  });
}