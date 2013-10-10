var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({ debug: true, parseOptions: console.log }),
    context = {};

// Create console readline interface.
var rl = readline.createInterface(process.stdin, process.stdout);

// Configure shotgun.
shell
    // Pass in a callback to be invoked when the context needs to be saved.
    .onContextSave(function (contextToSave) {
        context = contextToSave;
        rl.setPrompt("> ");
    })
    // This callback is fired every time shotgun sends data back to your application.
    .onData(function (data) {
        if (data.clearDisplay)
            // Some stupid and unintuitive escape sequence for clearing console windows...
            console.log('\u001B[2J\u001B[0;0f');
        if (data.line)
            console[data.line.type](data.line.text);
        if (data.exit) {
            rl.close();
            process.exit();
        }
    });

// Execute shotgun every time a line of text comes through the prompt.
rl.on('line', function (userInput) {
    shell.execute(userInput, context);
    rl.prompt();
});

// Start the prompt for the first time.
rl.prompt();