ShotgunShell
============

Shotgun Shell is a UI agnostic command-line framework. It allows you to quickly and easily write commands and plug them into the framework. Rather than assuming an interface, such as the Javascript console, Shotgun Shell returns a result object that acts as a set of instructions so that any UI can easily be built to consume it.

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

## Creating a Shotgun command module

Shotgun aims to make it extremely easy to write simple command modules. A Shotgun command module must expose 2 properties and 2 functions.

	// shotgun_commands/echo/index.js

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
	exports.invoke = function (res, args, options) {
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
		context: {},
		clearDisplay: false,
		lines: [
			{
				options: { charByChar: true },
				text: 'Hello world!'
			},
			{
				options: { charByChar: true },
				text: 'Hello world!'
			},
			{
				options: { charByChar: true },
				text: 'Hello world!'
			},
			{
				options: { charByChar: true },
				text: 'Hello world!'
			},
			{
				options: { charByChar: true },
				text: 'Hello world!'
			}
		]
	}

The lines are contained in an array. Each line object contains the text that will be displayed for that line and a options object containing meta information about the line such as bold, italic, underline, etc. charByChar is true by default; it tells the UI that if it can it should print out the line character by character to give it that movie-style terminal feel.

### The 'help' command

Shotgun has a few built-in commands and one of those is 'help'. When the help command is specified by itself it lists all the available commands and their description message. The help command also accepts an argument, the name of a specific command.

If a specific command is specified then the help command will print the command, the description, a usage syntax string listing all the available options for the command, and then it will invoke the specified command's help function which can then display additional help information if needed.

The shell instance has an execute function. This is the primary entry point into the ShotgunShell module. It takes in a command line string, parses it appropriately, and returns a result object.

	var result = shell.execute('help');
	console.log(result);

This would yield:

	{
		context: {},
		clearDisplay: false,
		lines: [
			{
				options: { charByChar: true },
				text: 'CLEAR        Clears the current display.'
			},
			{
				options: { charByChar: true },
				text: 'ECHO         Displays the supplied message.'
			},
			{
				options: { charByChar: true },
				text: 'HELP         Displays general help info or info for a specific command.'
			}
		]
	}

## The `invoke` function and the result object.

The `shell.execute()` function always returns a result object. You may have noticed in our example command above that this object gets passed into the `help` and `invoke` functions. You are allowed to add any properties you wish to this object, though it is not recommended that you overwrite this object altogether as Shotgun will add context information to it for you; if you overwrite this object you will lose this information.

The result object contains helper functions. While you could manually push an object to the lines array on the result object, it is far more convenient to use the provideed helper functions. Below is an example of using the `writeLine()` function. 

	exports.invoke = function (res, args, options) {
        res.writeLine('This is an example of using the writeLine() function.');
    };
    
Some functions, such as `writeLine()` take an options object if needed. In the case of `writeLine()` this object is added to each line object in the lines array.

	exports.invoke = function (res, args, options) {
		res.writeLine('If possible, the UI should display this line bolded, italicized, and underlined.', {
			bold: true,
			italic: true,
			underline: true
		});
	};

There are standard properties that Shotgun always adds to the result object such as `context`, `lines`, and `clearDisplay`. You can change these options when necessary, but you are also welcome to add your own values.

	// mycommand/index.js

	exports.invoke = function (res, args, options) {
		res.customMessage = 'This is a custom message.';
	};

	// app.js

	console.log(shell.execute('mycommand').customMessage);

`shell.execute` also takes an options object in case you need to make values available to your command without having to have them passed as arguments.

	// app.js

	shell.execute('mycommand', { someValue: true });

	// mycommand/index.js

	exports.invoke = function (res, args, options) {
		res.writeLine('Custom value: ' + options.someValue);
	};