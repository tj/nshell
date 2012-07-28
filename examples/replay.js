
// source with:
//   > . examples/replay

console.log('loaded!');

// repeat the previous command on
// blank lines. great for automating
// things like `make test`.

shell.on('blank', function(){
  shell.exec(shell.lastCommand);
});