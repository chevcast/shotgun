# Shotgun

Shotgun is a UI agnostic command shell. It allows you to quickly and easily write commands and plug them into the shell framework. Rather than assuming the UI, such as the Javascript console, Shotgun returns a result object that acts as a set of instructions so that any application can easily consume it.

---

## Module Installation

	npm install shotgun


## Module Usage

To use Shotgun you simply require it and create an instance of the shell.

	var shotgun = require('shotgun');
	var shell = new shotgun.Shell();

The shell optionally accepts a path (relative to the current working directory) to look for your custom command modules. If no directory is specified then 'cmds' is used by default. Shotgun will automatically read in and `require()` all node modules in the specified directory and it will plug them into the framework as commands as long as they expose the required properties and functions.

---

## Creating a Shotgun Command Module

Shotgun aims to make it extremely easy to write simple command modules. There is only one function that a command module must expose.

	// cmds/echo.js

	// The invoke function is where the command logic will go.
	exports.invoke = function (res, options, shell) {
		var iterations = options.iterations;
		for (var count = 0; count < iterations; count++) {
			res.log(options.message);
		}
	};

Command modules may also expose any of three other properties.

	// cmds/echo.js continued

	// A string containing a short description of the command.
	exports.description = 'Displays the supplied message.';

	// A string containing helpful usage syntax for the user.
	exports.usage = '<message> [options]';

	// Options is an object containing a comprehensive list of parameters that the command accepts and understands.
	exports.options = {
    	message: {
    	    nodash: true,
    		required: true,
    		description: 'The message to be displayed.'
    	},
    	iterations: {
    		aliases: ['i'],
    		required: true,
    		default: 1,
    		description: 'The number of times to display the message.',
    		validate: /^[1-9]\d*$/
    	}
    };

Any options specified in the user input will be passed to the `invoke()` function of the command regardless of whether or not they appear in the command's `options` property. The `options` property is used to validate specific options that the command understands. For instance, in the above example we provided a regular expression to the validation property on the iterations option. You may also supply a function to the validate property if you need a more customized validation.

	iterations: {
		aliases: ['i'],
		required: true,
		default: 1,
		description: 'The number of times to display the message.',
		validate: function (value) {
			return value > 0;
		}
	}

When you define options with `nodash` set to true, such as the message option in the above example, that lets Shotgun know that this option will have no hyphenated name provided in the user input. Options without names will be added to the `options` object that is passed to the command's `invoke()` function in the order they are found in the parsed user input. For example:

	echo "Dance monkey, dance!" -i 5

Using the sample 'echo' command we defined earlier the above sample user input would yield the following:

	// cmds/echo.js

	exports.invoke = function (res, options, shell) {
		options.iterations == 5; // true
		options.message == "Dance monkey, dance!"; // true
	};

Since the `message` option has `nodash` set to true Shotgun simply parses the user input and adds first non-named option to the options object under `message`. The order matters if the option has `nodash` enabled.

I stated earlier that named options are passed to the command even if they are not defined in the `options` property of that command. Thus, the following is valid:

	echo "Dance monkey, dance!" -i 5 --verbose

would yield:

	// cmds/echo.js

	exports.invoke = function (res, options, shell) {
		options.verbose == true; // true
	};

Despite `verbose` not being defined as part of the `options` property, it is still accessible if provided by the user. It will just be optional and won't undergo any validation.

### Our example 'echo' command

What we've done in the above example is create a simple command called 'echo' that will be plugged into the Shotgun shell framework simply by placing the module in the 'cmds' directory (or the directory you passed into the shell).

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

The lines are contained in an array. Each line object contains the text that will be displayed for that line and an `options` object containing meta information about the line such as bold, italic, underline, etc. charByChar is true by default; it tells the UI that if it can it should print out the line character by character to give it that movie-style terminal feel. The UI can then apply whatever display options it is capable of providing, but the options can be safely ignored if necessary. For example, if you were writing a console application then bold, italics, and underline wouldn't be possible. The options are just metadata that does not have to be used.

### The 'help' command

Shotgun has a few built-in commands and one of those is 'help'. When the help command is specified by itself it lists all the available commands and their description message. The help command also accepts an argument, the name of a specific command. If a specific command is specified then the help command will print the command, its usage syntax, its description, and list all the available options (if any) for the command.

The shell instance has an execute function. This is the primary entry point into the Shotgun module. It takes in a command line string, parses it appropriately, and returns a result object.

	var result = shell.execute('help');
	console.log(result);

This would yield:

	{
		context: {},
		clearDisplay: false,
		lines: [
			{
				options: { charByChar: true },
				text: 'clear        Clears the display.'
			},
			{
				options: { charByChar: true },
				text: 'echo         Displays the supplied text for a specified number of times.'
			}
			{
				options: { charByChar: true },
				text: 'exit         Exits the application.'
			},
			{
				options: { charByChar: true },
				text: 'help         Displays general help info or info about a specific command.'
			}
		]
	}

## The `invoke` function and the result object.

The `shell.execute()` function always returns a result object. You may have noticed in our example command above that this object gets passed into the `help` and `invoke` functions. You are allowed to add any properties you wish to this object, though it is not recommended that you overwrite this object altogether as Shotgun will add context information to it for you; if you overwrite this object you will lose this information.

The result object contains helper functions. While you could manually push an object to the lines array on the result object, it is far more convenient to use the provided helper functions. Below is an example of using the `log()` function.

	exports.invoke = function (res, options, shell) {
        res.log('This is an example of using the log() function.');
    };
    
Some functions, such as `log()` take an options object if needed. In the case of `log()` this object is added to each line object in the lines array.

	exports.invoke = function (res, args, options) {
		res.log('If possible, the UI should display this line bolded, italicized, and underlined.', {
			bold: true,
			italic: true,
			underline: true
		});
	};

There are standard properties that Shotgun always adds to the result object such as `context`, `lines`, `clearDisplay`, and `exit`. You can change these options when necessary, but you are also welcome to add your own values.

	// cmds/mycommand.js

	exports.invoke = function (res, options, shell) {
		res.customMessage = 'This is a custom message.';
	};

	// app.js

	console.log(shell.execute('mycommand').customMessage);

`shell.execute` also takes an options object in case you need to make values available to a command without them needing to be supplied as user input.

	// app.js

	shell.execute('mycommand', { someValue: true });

	// cmds/mycommand.js

	exports.invoke = function (res, options, shell) {
		res.log('Custom value: ' + options.someValue);
	};

Values supplied in this manner will override user input that matches it, so be mindful of the options you pass in. For example:

	// app.js

	shell.execute('mycommand --someValue "pizza"', { someValue: 'bacon' });

will yield:

	// cmds/mycommand.js

	exports.invoke = function (res, options, shell) {
		options.someValue; // 'bacon'
	};

## todo: Add documentation for prompt helper function.