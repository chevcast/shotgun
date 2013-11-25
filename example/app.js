var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({ debug: true });

var rl = readline.createInterface(process.stdin, process.stdout);

shell
    .on('error', console.error.bind(console))
    .on('log', function (text, options) {
        console[options.type](text);
    })
    .on('clear', function () {
        console.log('\u001B[2J\u001B[0;0f');
    })
    .on('exit', function () {
        rl.close();
        process.exit();
    });

rl.on('line', function (userInput) {
    shell.execute(userInput);
    rl.prompt();
});

rl.prompt();