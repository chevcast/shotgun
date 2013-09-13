var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({ debug: true }),
    context = {};

var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("> ");

rl.on('line', function (cmdStr) {
    shell.execute(cmdStr, context, function (result) {
        context = result.context;
        if (context.passive) rl.setPrompt(context.passive.msg + " > ");
        else rl.setPrompt("> ");
        if (result.clearDisplay)
            console.log('\u001B[2J\u001B[0;0f');
        result.lines.forEach(function (line) {
            console[line.type](line.text);
        });
        result.exit ? rl.close() : rl.prompt();
    });
});

rl.prompt();