var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell(),
    context = {};

var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("> ");

rl.on('line', function (cmdStr) {
    var result = shell.execute(cmdStr, context);
    context = result.context;
    if (result.clearDisplay)
        console.log('\u001B[2J\u001B[0;0f');
    result.lines.forEach(function (line) {
        console[line.type](line.text);
    });
    result.exit ? rl.close() : rl.prompt();
});

rl.prompt();