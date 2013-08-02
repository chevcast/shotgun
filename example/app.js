var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({
        defaultCmds: {
            exit: false
        }
    }),
    context = {};

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function parseInput(cmdStr) {
    var result = shell.execute(cmdStr, context);
    context = result.context;
    if (result.clearDisplay)
        for (var i = 0; i < 50; i++)
            console.log('\r\n');
    result.lines.forEach(function (line) {
        console[line.type](line.text);
    });
    exit = result.exit;
    if (result.exit)
        rl.close();
    else
        rl.question("> ", parseInput);
}

rl.question("> ", parseInput);