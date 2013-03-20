# node-shotgun

Shotgun is a UI agnostic command shell. It allows you to quickly and easily write commands and plug them into the shell framework. Rather than assuming the UI, such as the Javascript console, shotgun returns a result object that acts as a set of instructions so that any application can easily consume it.

---

### Module Installation

    npm install shotgun


### Module Usage

To use shotgun you simply require it and create an instance of the shell.

    var shotgun = require('shotgun');
    var shell = new shotgun.Shell();

The shell optionally accepts a path (relative to the current working directory) to look for your custom command modules. If no directory is specified then 'cmds' is used by default. Shotgun will automatically read in and `require()` all node modules in the specified directory and it will plug them into the framework as commands as long as they expose the required properties and functions.

---

## Getting started using the shell.

Once you've setup shotgun and instantiated the shell you can build any UI application around it that you wish. The simplest application is just a basic console app so that's what we'll setup here.

1. First you'll need to install a module to help with reading values from the console so that you can pass them into your shotgun shell.
    > npm install prompt

2. Next set up a basic app to continually get a value from the user.

        var prompt = require('prompt');
        function callback(err, val) {
            if (!err && val.cmdStr) {
                console.log("Echo: " + val.cmdStr);
            }
            prompt.get('cmdStr', callback);
        }
        prompt.get('cmdStr', callback);

    So far we haven't done anything with shotgun. We've just put together a small app the continually asks the user for input and then prints that input to the console.

    > prompt: cmdStr: test  
    > Echo: test

3. Once you have a proper prompt application setup go ahead and install shotgun.
    > npm install shotgun

4. Require shotgun and instantiate a shell.

        var prompt = require('prompt'),
            shotgun = require('shotgun'),
            shell = new shotgun.Shell();

        function callback(err, val) {
            if (!err && val.cmdStr) {
                console.log("Echo: " + val.cmdStr);
            }
            prompt.get('cmdStr', callback);
        }
        prompt.get('cmdStr', callback);

5. Now that you have an instance of the shell you can begin to pass the user's value into the `execute()` function.

        var prompt = require('prompt'),
            shotgun = require('shotgun'),
            shell = new shotgun.Shell();

        function callback(err, val) {
            var result = {};
            if (!err && val.cmdStr) {
                result = shell.execute(val.cmdStr);
            }
            prompt.get('cmdStr', callback);
        }
        prompt.get('cmdStr', callback);

6. So far all we've done is pass the user's input on to shotgun and get back a `result` object, but we're not yet using it for anything. The `result` object returned from shotgun acts as a set of instructions. Depending on the command modules installed the result object could contain a wide variety of properties for you to consume in your application. There are a few default commands that come with shotgun: clear, exit, and help. 'clear' sets a property on the result called `clearDisplay`. 'exit' sets a property on the result called `exit`. 'help' writes a bunch of objects to a `lines` array on the result object. The lines array will always contain an array of objects, each object representing a single line of text. This is how shotgun stays UI agnostic because the app using shotgun can iterate over this array and display each line however it chooses to. Let's write some code to handle each of these situations:

        var prompt = require('prompt'),
            shotgun = require('shotgun'),
            shell = new shotgun.Shell();

        function callback(err, val) {
            var result = {},
                exit = false;
            if (!err && val.cmdStr) {
                result = shell.execute(val.cmdStr);

                if (result.clearDisplay) {
                    for(var i = 0; i < 50; i++) {
                        console.log('\r\n');
                    }
                }

                exit = result.exit;

                result.lines.forEach(function (line) {
                    console[line.type](line.text);
                });
            }
            if (!exit) {
                prompt.get('cmdStr', callback);
            }
        }
        prompt.get('cmdStr', callback);

    In the above example we do several things. First we check if `clearDisplay` is true. If it is then we print a bunch of blank lines to the display. Next we check if `exit` is true and if it is then we skip calling the prompt module and let the application exit. Lastly we iterate over the `lines` array. Each line object has a `type` property and a `text` property. Obviously `text` contains the text for that line; `type` contains either 'log', 'warn', or 'error' as it's value. You can do whatever you choose with that value but in this example I decided to map that to the functions with the same name on the `console`, passing in the `text`.

7. We're almost done but there is one more piece we need to include. To maintain state across executions shotgun hands back a context object. `result.context` contains information that allows shotgun to know if it was prompting the user for a value, among other things. You are welcome to examine this object in more detail, but the only thing you are required to do with it is pass it back in on each execution. To do this in our sample app we will create a `context` variable in a higher scope and update that with the value from `result`.

        var prompt = require('prompt'),
            shotgun = require('shotgun'),
            shell = new shotgun.Shell(),
            context = {};

        function callback(err, val) {
            var result = {},
                exit = false;
            if (!err && val.cmdStr) {

                // execute takes the user input string, an optional 'options' object, and the 'context' object we mentioned.
                result = shell.execute(val.cmdStr, {}, context);

                context = result.context;

                if (result.clearDisplay) {
                    for(var i = 0; i < 50; i++) {
                        console.log('\r\n');
                    }
                }

                exit = result.exit;

                result.lines.forEach(function (line) {
                    console[line.type](line.text);
                });
            }
            if (!exit) {
                prompt.get('cmdStr', callback);
            }
        }
        prompt.get('cmdStr', callback);

    Now our context object is traveling in a loop as we execute commands. Every time we execute a command we save the context and pass it back in with the next execution. If you were to use shotgun in a web application you would either need to send it to the client and then have the client send it back with the next request, or you would need to store it in session.

That's it, you're done with your first little shotgun app!

---

## Creating a Shotgun Command Module

Shotgun command modules are just Node modules. There isn't anything special about them except that they must define a specific function called 'invoke'.

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

When you define options with `nodash` set to true, such as the message option in the above example, that lets shotgun know that this option will have no hyphenated name provided in the user input. Options without names will be added to the `options` object that is passed to the command's `invoke()` function in the order they are found in the parsed user input. For example:

    echo "Dance monkey, dance!" -i 5

Using the sample 'echo' command we defined earlier the above sample user input would yield the following:

    // cmds/echo.js

    exports.invoke = function (res, options, shell) {
        options.iterations == 5; // true
        options.message == "Dance monkey, dance!"; // true
    };

Since the `message` option has `nodash` set to true shotgun simply parses the user input and adds first non-named option to the options object under `message`. The order matters if the option has `nodash` enabled.

I stated earlier that named options are passed to the command even if they are not defined in the `options` property of that command. Thus, the following is valid:

    echo "Dance monkey, dance!" -i 5 --verbose

would yield:

    // cmds/echo.js

    exports.invoke = function (res, options, shell) {
        options.verbose == true; // true
    };

Despite `verbose` not being defined as part of the `options` property, it is still accessible if provided by the user. It will just be optional and won't undergo any validation.

### Our example 'echo' command

What we've done in the above example is create a simple command called 'echo' that will be plugged into the shotgun shell framework simply by placing the module in the 'cmds' directory (or the directory you passed into the shell).

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

### The `invoke` function and the result object.

The `shell.execute()` function always returns a result object. You may have noticed in our example command above that this object gets passed into the `help` and `invoke` functions. You are allowed to add any properties you wish to this object, though it is not recommended that you overwrite this object altogether as shotgun will add context information to it for you; if you overwrite this object you will lose this information.

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

There are standard properties that shotgun always adds to the result object such as `context`, `lines`, `clearDisplay`, and `exit`. You can change these options when necessary, but you are also welcome to add your own values.

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

### Prompting the user for a value.

Shotgun wants to make it extremely easy for you to write command modules. To that end shotgun provides you with an easy API that can be used to prompt the user for a value.

    exports.invoke = function (res, options, shell) {
        res.prompt('Please enter a value.', function (value) {
            // do something with value.
        });
    };

The simplest usage of `res.prompt()` simply gets a value from the user. That value is then provided to your callback function. A lot of context magic happens behind the scenes to make this happen but the result is a clean API for you to use when writing command modules. Optionally, you can prompt the user for a specific option name. Here's an example.

    exports.invoke = function (res, options, shell) {
        res.prompt('Please enter a username.', 'username', function (username) {
            res.log('Welcome ' + username + '!');
        });
    };

When prompt is provided a variable name, in this case "username", it will first check the supplied options object to see if that variable was provided. If it was then it immediately invokes the callback and passes in the value without prompting the user for anything. If the value is not found on the options object then it will prompt the user for the value. This allows the user to do things like this:

> $ login  
> Please enter a username.  
> $ charlie  
> Welcome charlie!

or the user could specify username up front and skip the prompt altogether!

> $ login --username charlie  
> Welcome charlie!

Keep in mind that if the option you are prompting for is defined as a **required** option on your command then shotgun will complain if the value is not supplied before it even calls your `invoke()` function. Similarly, if your option has a default value defined then the user will never be prompted because the prompt helper will see the default value and use that if it is not supplied.

Prompts are also capable of being nested if needed.

    exports.invoke = function (res, options, shell) {
        res.prompt('Please enter a username.', 'username', function (username) {
            res.prompt('Please enter your password.', 'password', function (password) {
                if (username.toLowerCase() === 'charlie' && password === 'password123') {
                    res.log('Success!');
                }
                else {
                    res.error('Username or password incorrect.');
                }
            });
        });
    };

This short little snippet would allow the user to supply the values several ways.

> $ login  
> Please enter a username.  
> $ charlie  
> Please enter your password.  
> $ password123  
> Success!

or

> $ login --username charlie  
> Please enter your password.  
> $ password123  
> Success!

or

> $ login --username charlie --password password123  
> Success!

It gets even better though. If you define options on your command with `nodash` set to true then you can omit the '--username' and '--password' identifiers.

    exports.options = {
        username: {
            nodash: true
        },
        password: {
            nodash: true
        }
    };

Now that you've defined those options on your command the user no longer has to include the hyphenated option identifiers.

> $ login charlie password123  
> Success!

Because shotgun is UI agnostic we don't have convenient console functionality like CTRL + C to end a current action. To mitigate that shotgun looks for the special user input "cancel" and will cancel the active prompt.

> $ login  
> Please enter a username.  
> $ cancel  
> prompt canceled

### Setting a helpful command context.

Command contexts are extremely helpful and save the user a lot of keystrokes. Basically a command context is a state that tells shotgun to pass all supplied values to the command in the context. It will be easier to illustrate this concept with an example. Let's say you are authoring a 'topic' command module. This command is responsible for showing a topic on a forum board. To execute this command the user would supply a topic ID to the command like 'topic 123' and the command would display the content of the forum topic with ID 123. Now let's say the user wants to reply to topic 123 and in order to do that you've setup a '-r' option that will prompt them for their reply text. The user's experience would go something like this:

> $ topic 123  
> [displays topic content]  
> $ topic 123 -r  
> Please enter your reply.

The user is forced to type the entire 'topic 123' command over again just so he/she can supply the '-r' flag. With command contexts your topic command can simply do this:

    res.setContext('topic 123');

This simple helper will setup a command context. Now all the user's input will be appended to that context. The new user experience will be something like this:

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

Notice how the user was able to run the 'help' command after the 'topic 123' context was set. When the 'help' command finished the user was still able to supply just the '-r' because the context was still active. The default 'clear' command resets the active context but if you do need to clear the active context anywhere else in your command modules then you can run the following helper:

    res.resetContext();

Context is even preserved across prompts. The prompt will take over temporarily and prompt the user for a value but will immediately restore the previous context, if any, when it is finished.
