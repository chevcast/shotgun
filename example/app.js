var ShotgunShell = require('../index');
var shell = new ShotgunShell();
console.log(shell.execute('echo', { something: true }));