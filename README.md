ShotgunShell
============

Shotgun Shell is a UI agnostic command-line framework. It allows you to quickly and easily write commands and plug them into the framework. Rather than assuming an interface, such as the Javascript console, Shotgun Shell returns a JSON result that acts as a set of instructions so that any UI can easily be built to consume it.

---

## Module Installation

    npm install ShotgunShell


## Module Usage

To use Shotgun you simply require it.

    var ShotgunShell = require('ShotgunShell');
    
Create an instance of the shell, passing in a path to a directory where your Shotgun command modules are located.

    var shell = new ShotgunShell('./shotgun_commands');
    
Shotgun will automatically read in and `require()` all node modules in the specified directory and it will plug them into the framework as commands.

---

## Creating Shotgun command modules

Shotgun aims to make it extremely easy to write simple command modules. A Shotgun command module must expose 2 properties and 2 functions.

    // shotgun_commands/echo/indjex.js

    // options is an array of available parameters that can be specified as arguments to the command.
    exports.options = [
        {
            name: 'message',
            description: 'The message to be displayed.',
            type: 'requiredValue'
        },
        {
            name: 'iterations', // the name of the option.
            option: 'i,iterations', // comma-separated list of aliases.
            description: 'Reprints the message for the specified number of iterations.', // a description of what the parameter does.
            type: 'bit', // bit, optionalValue, requiredValue
            validate: '\d+' // Regex or function.
        }
    ];
    
    // a string containing a short description of the command.
    exports.description = 'Displays the supplied message.';

    // the help function should return detailed help text.
    exports.help = function (res, options) {
        res.writeLine('Echo takes a message and displays it. If the optional [iterations] parameter is supplied it will print the message for the specified number of lines.');
    };
        
    // the invoke function is where the command logic will go.
    exports.invoke = function (res, args, locals) {
        var iterations = args.iterations || 1;
        for (var count = 0; count < iterations; count++) {
            res.writeLine(args.message);
        }
    };
    
### Our example 'echo' command

What we've done in the above example is create a simple command called 'echo' that will be plugged into the Shotgun framework. 

The example command we just wrote is a pretty simple command. It performs a small task and only accepts one option. The nice thing about Shotgun is that you don't have to do any pre-parsing of user input before passing it along to the module. Shotgun does all the legwork for you, allowing you to focus on creating well-designed command modules instead of worrying about user input, context, etc.

    var result = shell.execute('echo -i 5 "Hello world!"');
    console.log(result);
    
This would yield:

    {
        clear: false,
        lines: [
            {
                displayOptions: { charByChar: true },
                text: 'Hello world!'
            },
            {
                displayOptions: { charByChar: true },
                text: 'Hello world!'
            },
            {
                displayOptions: { charByChar: true },
                text: 'Hello world!'
            },
            {
                displayOptions: { charByChar: true },
                text: 'Hello world!'
            },
            {
                displayOptions: { charByChar: true },
                text: 'Hello world!'
            }
        ]
    }
    
The lines are contained in an array. Each line object contains the text that will be displayed for that line and a displayOptions object containing meta information about the line such as bold, italic, underline, etc. charByChar is true by default; it tells the UI that if it can it should print out the line character by character to give it that movie-style terminal feel.
    
### The 'help' command
    
Shotgun has a few built-in commands and one of those is 'help'. When the help command is specified by itself it lists all the available commands and their description message. The help command also accepts an argument, the name of a specific command.

If a specific command is specified then the help command will print the command, the description, a usage syntax string listing all the available options for the command, and then it will invoke the specified command's help function which can then display additional help information if needed.

The shell instance has an execute function. This is the primary entry point into the ShotgunShell module. It takes in a command line string, parses it appropriately, and returns a result object.

    var restult = shell.execute('help');
    console.log(result);
    
This would yield:

    {
        clear: false,
        lines: [
            {
                displayOptions: { charByChar: true },
                text: 'CLEAR        Clears the current display.'
            },
            {
                displayOptions: { charByChar: true },
                text: 'ECHO         Displays the supplied message.'
            },
            {
                displayOptions: { charByChar: true },
                text: 'HELP         Displays general help info or info for a specific command.'
            }
        ]
    }
