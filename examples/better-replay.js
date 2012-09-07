
// source with:
//   > . examples/better-replay

console.log('loaded!');

// repeat the previous command on
// blank lines. great for automating
// things like `make test`.

shell.on('command', replay);

function replay(e){
  switch (e.line.trim()) {
    case '':
      e.preventDefault();
      shell.exec(shell.lastCommand);
      break;
    case 'stop replay':
      e.preventDefault();
      console.log('stopping!');
      shell.removeListener('command', replay);
      break;
  }
}

