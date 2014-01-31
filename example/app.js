var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({ debug: true }),
    currentUser = "guest",
    contexts = {
        guest: {},
        joe: {}
    };

var rl = readline.createInterface(process.stdin, process.stdout);

shell
    .on('switchUser', function (username, contextData) {
        contexts[currentUser] = contextData;
        currentUser = username;
        shell.log("User switched to: " + currentUser);
    })
    .on('log', function (text, options) {
        if (text.length > 0)
            text = currentUser + ': ' + text;
        console[options.type](text);
    })
    .on('clear', function () {
        console.log('\u001B[2J\u001B[0;0f');
    })
    .on('exit', function () {
        rl.close();
        process.exit();
    })
    .on('error', console.error.bind(console));

rl.on('line', function (userInput) {
    shell.execute(userInput, null, contexts[currentUser]);
    rl.prompt();
});

rl.prompt();
