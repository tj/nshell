
// source with:
//   > . examples/js-expansion
//   > echo `Math.pow(2, 32)`

console.log('loaded!');

shell.on('command', function(e){
  e.line = expansion(e.line);
});

function expansion(line) {
  return line.replace(/`(.*?)`/, function(_, js){
    return eval('(' + js + ')');
  });
}