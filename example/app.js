var readline = require('readline'),
    shotgun = require('../index'),
    // Create a new shotgun shell instance.
    shell = new shotgun.Shell({ debug: true }),
    // Store the currently active user.
    currentUser = "guest",
    // Store each user's context data here.
    contexts = {
        guest: {},
        joe: {}
    };

// Use node's core readline library to create a looping prompt for user input.
var rl = readline.createInterface(process.stdin, process.stdout);
// Set the prompt string.
rl.setPrompt(currentUser + '> ');

shell
    // We expect to receive the new username and the contextData for the current
    // user so we can store it for later.
    .on('switchUser', function (username, currentUserContext) {
        contexts[currentUser] = currentUserContext;
        currentUser = username;
        shell.log("User switched to: " + currentUser);
        
        // Set prompt string so it includes the active username.
        rl.setPrompt(currentUser + '> ');
    })
    // When the log event occurs just log the text to the console.
    // What you do with the text here depends on the type of application you are
    // building.
    .on('log', function (text, options) {
        console.log(text);
    })
    // When the clear event occurs clear the console with these ASCII control
    // sequences. http://stackoverflow.com/questions/8813142/clear-terminal-window-in-node-js-readline-shell
    .on('clear', function () {
        console.log('\u001B[2J\u001B[0;0f');
    })
    // When the exit event occurs, kill the readline prompt and then kill the process.
    .on('exit', function () {
        rl.close();
        process.exit();
    })
    // If any errors occur then send them straight to stderr.
    .on('error', console.error.bind(console));

rl.on('line', function (userInput) {
    // On each user input, pass the input straight into your shell
    // and let shotgun work its magic.
    shell.execute(userInput, contexts[currentUser]);

    // Resume the readline prompt.
    rl.prompt();
});

rl.prompt();
