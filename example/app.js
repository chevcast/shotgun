var readline = require('readline'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({ debug: true }),
    context = {};

// Create console readline interface.
var rl = readline.createInterface(process.stdin, process.stdout);

// Configure shotgun.
shell
    // Set the object that shotgun should use to maintain context information.
    .setContextStorage(context)
    // This callback is fired every time the context object is modified.
    .onContextChanged(function (context) {
        if (context.passive)
            // Set prompt text in console window to show context info.
            rl.setPrompt(context.passive.msg + " > ");
        else
            // Reset prompt text back to just >
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
    shell.execute(userInput);
    rl.prompt();
});

// Start the prompt for the first time.
rl.prompt();