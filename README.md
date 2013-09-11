# shotgun

[![Build Status](https://travis-ci.org/Chevex/shotgun.png)](https://travis-ci.org/Chevex/shotgun)
[![Dependencies Status](https://gemnasium.com/Chevex/shotgun.png)](https://gemnasium.com/Chevex/shotgun)
[![NPM version](https://badge.fury.io/js/shotgun.png)](http://badge.fury.io/js/shotgun)

> Shotgun is a UI agnostic command shell. It allows you to quickly and easily write commands and plug them into the shell framework. Rather than assuming the UI, such as the Javascript console, shotgun returns a result object that acts as a set of instructions so that any application can easily consume it, including web applications. In fact, I took the liberty of writing a separate module called [shotgun-client](https://npmjs.org/package/shotgun-client) that makes it simple to integrate shotgun with any web application.

---

### Module Installation

    npm install shotgun


### Module Usage

To use shotgun you simply require it and create an instance of the shell.

    var shotgun = require('shotgun');
    var shell = new shotgun.Shell();

The shell optionally accepts an options object. One of the options available is `cmdsDir` which is a path to the directory containing your custom command modules (relative to the current working directory). If no directory is specified then 'shotgun_cmds' is used by default. Shotgun will automatically read in and `require()` all node modules in the specified directory and it will plug them into the framework as commands as long as they expose the required properties and functions.

---

## Getting started using the shell.

Once you've setup shotgun and instantiated the shell you can build any UI application around it that you wish. The simplest application is just a basic console app so that's what we'll setup here.

1. First set up a basic app to continually get a value from the user.

        var readline = require('readline');

        // Create interface that reads from console and outputs to console.
        var rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt("> ");

        rl.on('line', function (cmdStr) {
            console.log("Echo: %s", cmdStr);
            rl.prompt();
        }).on('close', process.exit);

        rl.prompt();

    So far we haven't done anything with shotgun. We've just put together a small app that continually asks the user for input and then prints that input to the console.

    > > test
    > Echo: test

3. Once you have a proper prompt application setup go ahead and install shotgun.

    > npm install shotgun

4. Require shotgun and instantiate a shell.

        var readline = require('readline'),
            shotgun = require('shotgun'),
            shell = new shotgun.Shell();

        ...

5. Now that you have an instance of the shell you can begin to pass the user's value into the `execute()` function.

        var readline = require('readline'),
            shotgun = require('../index'),
            shell = new shotgun.Shell();

        // Create interface that reads from console and outputs to console.
        var rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt("> ");

        rl.on('line', function (cmdStr) {
            var result = shell.execute(cmdStr);
            rl.prompt();
        }).on('close', process.exit);

        rl.prompt();

6. So far all we've done is pass the user's input on to shotgun and get back a `result` object, but we're not yet using it for anything. The `result` object returned from shotgun acts as a set of instructions. Depending on the command modules installed the result object could contain a wide variety of properties for you to consume in your application. There are a few default commands that come with shotgun: clear, exit, and help. 'clear' sets a property on the result called `clearDisplay`. 'exit' sets a property on the result called `exit`. 'help' writes a bunch of objects to a `lines` array on the result object. The lines array will always contain an array of objects, each object representing a single line of text. This is how shotgun stays UI agnostic because the app using shotgun can iterate over this array and display each line however it chooses to. Let's write some code to handle each of these situations:

        var readline = require('readline'),
            shotgun = require('../index'),
            shell = new shotgun.Shell();

        // Create interface that reads from console and outputs to console.
        var rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt("> ");

        rl.on('line', function (cmdStr) {
            var result = shell.execute(cmdStr);
            if (result.clearDisplay)
                console.log('\u001B[2J\u001B[0;0f');
            result.lines.forEach(function (line) {
                console[line.type](line.text);
            });
            result.exit ? rl.close() : rl.prompt();
        }).on('close', process.exit);

        rl.prompt();

    In the above example we do several things with the restult. First we check if `clearDisplay` is true. If it is then we clear the console display using [ASCII control sequences](http://ascii-table.com/ansi-escape-sequences-vt-100.php). Next we check if `exit` is true and if it is then we skip asking the user for input again and let the application exit. Lastly we iterate over the `lines` array. Each line object has a `type` property and a `text` property. Obviously `text` contains the text for that line; by default `type` contains either 'log', 'warn', 'error', or 'debug' as it's value. You can do whatever you choose with that value but in this example I decided to map that to the functions with the same name on `console`, passing in the line `text` to be displayed.

7. We're almost done but there is one more piece we need to include. To maintain state across executions shotgun hands back a context object. `result.context` contains information that allows shotgun to know if it was prompting the user for a value, among other things. You are welcome to examine this object in more detail, but the only thing you are required to do with it is pass it back in on each execution. To do this in our sample app we will create a `context` variable in a higher scope and update that with the value from `result`.

        var readline = require('readline'),
            shotgun = require('../index'),
            shell = new shotgun.Shell(),
            context = {}; // Declare empty context object.

        // Create interface that reads from console and outputs to console.
        var rl = readline.createInterface(process.stdin, process.stdout);
        rl.setPrompt("> ");

        rl.on('line', function (cmdStr) {
            var result = shell.execute(cmdStr, context); // Pass in the context object.
            context = result.context; // Overwrite context object with updated context object from shotgun.
            if (result.clearDisplay)
                console.log('\u001B[2J\u001B[0;0f');
            result.lines.forEach(function (line) {
                console[line.type](line.text);
            });
            result.exit ? rl.close() : rl.prompt();
        }).on('close', process.exit);

        rl.prompt();

    Now our context object is traveling in a loop as we execute commands. Every time we execute a command we save the context and pass it back in with the next execution. If you were to use shotgun in a web application you would either need to send it to the client and then have the client send it back with the next request, or you would need to store it in session.

That's it, you're done with your first little shotgun app!

---

## Creating a Shotgun Command Module

Shotgun command modules are just Node modules. There isn't anything special about them except that they must define a specific function called 'invoke'.

    // cmds/echo.js

    // The invoke function is where the command logic will go.
    exports.invoke = function (options, shell) {
        var res = this;
        var iterations = options.iterations;
        for (var count = 0; count < iterations; count++) {
            res.log(options.message);
        }
    };

Within the `invoke` function two parameters are passed in for you to use. The first is `options` which simply stores all the user-supplied options when invoking your command. The second option is the instance of the shotgun `shell`. The shell allows you to access other command modules via the `cmds` collection.

In the body of the `invoke` function you also have access to a *result API* via the `this` keyword. As in the above example you may want to assign `this` to a variable in case you define your own functions within `invoke` where `this` would refer to a different scope. Within `invoke` the `this` keyword refers to a result object with some helper functions defined for you.

### Helper Functions

The result object's helper functions are as follows:

- `log` - Adds a line of text to the `lines` array on the result object.
- `warn` - Same as `log` except it changes the line's `type` property to "warn".
- `error` - Same as `warn` except `type` is set to "error".
- 'debug' - Same as others except `type` is set to "debug".

`warn`, `error`, and `debug` are useful for giving context to lines of text so that the UI can apply different styling behaviors when displaying the text to the user. For example your command might do something like `this.warn('The value supplied is below the minimum threshold.');` within the `invoke` function. This adds a line object to the `lines` array on the result object that will be passed to the application using shotgun. When the application iterates over the `lines` array it will see that the line has a property called `type` that is set to "error" and it will know to display the text differently from the normal `log` type.

There are two other helper functions available known as `setContext` and `resetContext` but we'll go into more detail with those later in this README.

### Optional Command Properties

Command modules may also expose any of three other properties.

    // cmds/echo.js continued

    // A string containing a short description of the command.
    exports.description = 'Displays the supplied message.';

    // A string containing helpful usage syntax for the user.
    exports.usage = '<message> [options]';

    // Options is an object containing a comprehensive list of parameters that the command accepts and understands.
    exports.options = {
        message: {
            noName: true,
            required: true,
            description: 'The message to be displayed.',
            prompt: true
        },
        iterations: {
            aliases: ['i'],
            required: true,
            default: 1,
            description: 'The number of times to display the message.',
            validate: /^[1-9]\d*$/
        }
    };

Any options specified in the user input will be passed to the `invoke()` function of the command regardless of whether or not they appear in the command's `options` property. The `options` property is used to validate specific options that the command understands. For instance, in the above example we provided a regular expression to the validation property on the iterations option. You may also supply a function to the validate property if you need more customized validation.

    iterations: {
        aliases: ['i'],
        required: true,
        default: 1,
        description: 'The number of times to display the message.',
        validate: function (value, options) {
            return value > 0;
        }
    }

When you define options with `noName` set to true, such as the message option in the above example, that lets shotgun know that this option will have no hyphenated name provided in the user input. Options without names will be added to the `options` object that is passed to the command's `invoke()` function in the order they are found in the parsed user input. For example:

    echo "Dance monkey, dance!" -i 5

Using the sample 'echo' command we defined earlier the above sample user input would yield the following:

    // cmds/echo.js

    exports.invoke = function (options, shell) {
        options.iterations == 5; // true
        options.message === "Dance monkey, dance!"; // true
    };

Since the `message` option has `noName` set to true shotgun simply parses the user input and adds first non-named option to the options object under `message`. The order matters if the option has `noName` enabled.

I stated earlier that named options are passed to the command even if they are not defined in the `options` property of that command. Thus, the following is valid:

    echo "Dance monkey, dance!" -i 5 --verbose

would yield:

    // cmds/echo.js

    exports.invoke = function (options, shell) {
        options.verbose == true; // true
    };

Despite `verbose` not being defined as part of the `options` property of the command module, it is still accessible if provided by the user. It will just be optional, won't undergo any validation, and won't show up in that command modules help information.

### Defined Command Options

As explained above, the user can supply any option they wish and your command module could access that value via the supplied `options` object. Defining `exports.options` on your command module is just a way to tell shotgun what options your module understands and what rules to apply to those options if they are found. Here is a comprehensive list of available properties you can set for each option you define for your command module:

#### aliases

    exports.options = {
        message: {
            aliases: ['m', 'msg']
        }
    };

Sometimes you may not want the user to have to type `--message` as a parameter for your command every single time. You can supply aliases so that the user can supply one of the aliases instead. In the above example the user could supply `-m` or `--msg` instead of `--message` if they chose to.

#### default

    exports.options = {
        message: {
            default: 'Hello World'
        }
    };

Defining options with a default value ensures that the option will have a value even if the user does not supply one. In the above example the user could supply a message, but if they don't then the default value of "Hello World" would be used.

#### description

    exports.options = {
        message: {
            description: "A message to be displayed."
        }
    };

You don't have to supply a description, but if you do then it will show up when the user attempts to get help information for the command by typing `help commandName`.

#### hidden

    exports.options = {
        message: {
            hidden: true
        }
    };

Supplying `hidden: true` will cause the default "help" command to hide this option when showing available options for the command. This is useful if you have set `noName: true` since you will likely include unnamed command options in the command's usage string.

 Example:

    // login.js
    var db = require('./db');
    exports.description = "Allows the user to sign in with their username and password.";
    exports.usage = "[username] [password]";
    exports.options = {
        username: {
            noName: true,
            required: true,
            prompt: "Please enter your username.",
            validate: function (username) {
                return db.checkUserExists(username);
            },
            hidden: true
        },
        password: {
            noName: true,
            required: true,
            prompt: "Please enter your password.",
            validate: function (password, options) {
                var user = db.getUser(options.username);
                return user.password === password;
            },
            hidden: true,
            password: true
        }
    };
    exports.invoke = function (options, shell) {
        // Do authentication stuff.
    };

In the above module there is no reason to display "--username" or "--password" in the help menu because users will almost never explicitly supply them. They will either include them with no names or be prompted for them.

#### noName

    exports.options = {
        message: {
            noName: true
        }
    };

Supplying `noName: true` tells shotgun that this option does not have to be specified by name. For example, the user could supply `"some value"` instead of `--message "some value"`. Keep in mind that options with no name are evaluated in order. If you have two options with `noName: true` then the first user-supplied value without a name will be used for the first option you defined and the second user-supplied value with no name will be used for the second option. The order does not matter when options are supplied with a name, even if `noName` is true.

#### password

    exports.options = {
        message: {
            password: true
        }
    };

Setting `password: true` only has an effect if a `prompt` is also set. This tells shotgun to set `result.password = true;` on the result object. If the UI chooses to it could use this password property to modify the UI input field to be a password field for the prompt. This is useful for a login command where the command will prompt the user for their password.

#### prompt

    exports.options = {
        message: {
            prompt: true // or prompt: 'Enter a message.'
        }
    };

If you specify `prompt: true` on your option and `required` is also true then the user will be prompted for the value if they did not supply the option themselves. If `prompt` is true but `required` is not set to true and the user supplied the option with no value then they will be prompted. If `prompt` is set to true then it will prompt the user with a default message like "Enter value for message." You also have the option to supply your own message by simply replacing `true` with a string. The supplied string will be displayed instead of the default message.

#### required

    exports.options = {
        message: {
            required: true
        }
    };

This is one of the simpler options. If you set `required: true` on an option then shotgun will display an error to the user if they do not supply a value. One caveat is if you supply a default value or a prompt because either the default value will be used if there is no user-supplied value or the user will be prompted for the value.

#### validate

    // Regular expression.
    exports.options = {
        message: {
            validate: /^[a-z0-9]$/i // Only alpha-numeric characters are allowed.
        }
    };

    // Validation Function
    exports.options = {
        message: {
            validate: function (msg, options) {
                return msg === 'Hello world!';
            }
        }
    };

Validate allows you to specify a regular expression or a function that will inform shotgun that the supplied value should be validated. If the value does not pass validation then an error will be displayed to the user and they will have to supply valid input before the command will be invoked. If you use a validation function it accepts two parameters. The first is the value of the property that you want to validate. The second is all of the supplied options the user passed in. (NOTE: Keep in mind that command options are validated in order. If you access `options` in your validation function any options that appear after the one you're currently validating then those options will not have been validated yet.

### Our example 'echo' command

What we did in a previous example is create a simple command called 'echo' that will be plugged into the shotgun shell framework simply by placing the module in the 'shotgun_cmds' directory (or the directory you passed into the shell).

The example command we just wrote is a pretty simple command. It performs a small task and only accepts one option. The nice thing about shotgun is that you don't have to do any pre-parsing of user input before passing it along to the module. Shotgun does all the legwork for you, allowing you to focus on creating well-designed command modules instead of worrying about user input, context, etc.

    var result = shell.execute('echo -i 5 "Hello world!"');
    console.log(result);

This would yield:

    {
        context: {},
        clearDisplay: false,
        lines: [
            {
                options: { charByChar: true },
                type: 'log',
                text: 'Hello world!'
            },
            {
                options: { charByChar: true },
                type: 'log',
                text: 'Hello world!'
            },
            {
                options: { charByChar: true },
                type: 'log',
                text: 'Hello world!'
            },
            {
                options: { charByChar: true },
                type: 'log',
                text: 'Hello world!'
            },
            {
                options: { charByChar: true },
                type: 'log',
                text: 'Hello world!'
            }
        ]
    }

The lines are contained in an array. Each line object contains the text that will be displayed for that line and an `options` object containing meta information about the line such as bold, italic, underline, etc. You can see that `charByChar` is true by default without you setting it; this tells the UI that if it can it should print out the line character by character to give it that movie-style terminal feel. The UI can then apply whatever display options it is capable of providing, but the options can be safely ignored if necessary. For example, if you were writing a console application then bold, italics, and underline wouldn't be possible. The options are just metadata that does not have to be used. We include `charByChar: true` by default for a couple reasons. First, many people want every line of text to be displayed character by character but they don't want to have to set a line property every single time they use `log()`. Second, [shotgun-client](https://npmjs.org/package/shotgun-client) includes character by character typing by default and uses this line option. So by default it is true and you are able to set it to false where necessary, such as when displaying HTML markup (which breaks if JavaScript tries to print out HTML tags character by character into the browser). If you don't want it true by default then simply ignore the line option in your UI; it is not required.

### The 'help' command

Shotgun has a few built-in commands and one of those is 'help'. When the help command is specified by itself it lists all the available commands and their description message. The help command also accepts an argument, the name of a specific command. If a specific command is specified then the help command will print the command, its usage syntax, its description, and list all the defined available options (if any) for the command.

The shell instance has an execute function. This is the primary entry point into the shotgun module. It takes in a command line string, parses it appropriately, and returns a result object.

    var result = shell.execute('help');
    console.log(result);

This would yield:

    {
        context: {},
        clearDisplay: false,
        lines: [
            {
                options: { charByChar: true },
                type: 'log',
                text: 'clear        Clears the display.'
            },
            {
                options: { charByChar: true },
                type: 'log',
                text: 'echo         Displays the supplied text for a specified number of times.'
            }
            {
                options: { charByChar: true },
                type: 'log',
                text: 'exit         Exits the application.'
            },
            {
                options: { charByChar: true },
                type: 'log',
                text: 'help         Displays general help info or info about a specific command.'
            }
        ]
    }

### The `invoke` function and the result object.

The `shell.execute()` function always returns a result object. You are able to access this result object from within your command module's `invoke` function via the `this` keyword; it is often a good idea to assign `this` to a variable in order to maintain reference to it. You are allowed to add any properties you wish to this object, though it is not recommended that you overwrite this object altogether as shotgun will add context information to it for you; if you overwrite this object you will lose this information and your app may exhibit unexpected behavior.

The result object contains helper functions. While you could manually push an object to the lines array on the result object:

    exports.invoke = function (options, shell) {
        this.lines.push({
            options: { charByChar: true },
            type: 'log',
            text: 'This is an example of manually adding a line of text to the lines array.'
        });
    };

It is far more convenient to use the provided helper functions:

    exports.invoke = function (options, shell) {
        this.log('This is an example of using the log() function.');
    };

The text helper functions such as `log()`, `warn()`, `error()`, and `debug()`, accept an options object as a second argument if needed. This options object is added to the line object before the line object is added to the lines array.

    exports.invoke = function (options, shell) {
        this.log('If possible, the UI should display this line bolded, italicized, and underlined.', {
            bold: true,
            italic: true,
            underline: true
        });
    };

There are standard properties that shotgun adds to the result object such as `context`, `lines`, `clearDisplay`, and `exit`. You can change these options when necessary, but you are also welcome to add your own values.

    // cmds/mycommand.js

    exports.invoke = function (options, shell) {
        this.customValue = 'This is a custom value.';
    };

    // app.js

    console.log(shell.execute('mycommand').customValue);

`shell.execute` also takes an options object in case you need to make values available to a command without them needing to be supplied as user input.

    // app.js

    shell.execute('mycommand', { someValue: true });

    // cmds/mycommand.js

    exports.invoke = function (options, shell) {
        this.log('Custom value: ' + options.someValue);
    };

Values supplied in this manner will override user input that matches it, so be mindful of the options you pass in. For example:

    // app.js

    shell.execute('mycommand --someValue "pizza"', { someValue: 'bacon' });

will yield:

    // cmds/mycommand.js

    exports.invoke = function (options, shell) {
        options.someValue === 'bacon'; // true
    };

### Setting a helpful command context.

Command contexts are extremely helpful and save the user a lot of keystrokes. Basically a command context is a state that tells shotgun to pass all supplied values to the command in the context. It will be easier to illustrate this concept with an example. Let's say you are authoring a 'topic' command module. This command is responsible for showing a topic on a forum board. To execute this command the user would supply a topic ID to the command like 'topic 123' and the command would display the content of the forum topic with ID 123. Now let's say the user wants to reply to topic 123 and in order to do that you've setup a '-r' option that will prompt them for their reply text. The user's experience would go something like this:

> $ topic 123  
> [displays topic content]  
> $ topic 123 -r  
> Please enter your reply.

The user is forced to type the entire 'topic 123' command over again just so he/she can supply the '-r' flag. With command contexts you can simply call this helper function from inside your command module:

    this.setContext('topic 123');

This simple helper will setup a command context for 'topic 123'. Now all the user's input will be appended to that context. The new user experience will be something like this:

> $ topic 123  
> [displays topic content]  
> $ -r  
> Please enter your reply.

The full command is expanded out to 'topic 123 -r' because shotgun knows that 'topic 123' is the current context. How does the user clear the context you ask? They don't have to! If the supplied input from the user matches another command then shotgun will disregard the context and execute that command. If that command creates a different context then it will override the previous context. If that command does not create a new context then the context will be restored after the command is finished. Basically this means a user experience like the following is possible:

> $ topic 123  
> [displays topic content]  
> $ help topic  
> [displays help for the topic command]
> $ -r  
> Please enter your reply.

Notice how the user was able to run the 'help' command after the 'topic 123' context was set. When the 'help' command finished the user was still able to supply just the '-r' because the context was still active. The default 'clear' command resets the active context but if you need to clear the active context manually anywhere else in your command modules then you can run the following helper function:

    this.resetContext();

I usually use this helper if I'm clearing the display from another command. The included 'clear' command module already does this, but sometimes other command modules I write will also clear the screen. For example, I wrote an 'about.js' command module that displays several paragraphs of text. I don't want to simply append all that text to whatever else is already in the user's current display so I made my 'about' command set `this.clearDisplay = true;`. Now let's say that the user had executed 'topic 123' and is currently viewing the topic body. Now say the user decides to execute the 'about' command. The command clears the display so the topic body is no longer visible. From the user's perspective it wouldn't make sense at this point for '-r' to allow the user to reply to topic 123. There may be exceptions, but anytime the display is cleared it makes sense to also reset any command contexts.
