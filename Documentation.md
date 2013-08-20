# Shotgun API Documentation

## Shell

    var shell = new require('shotgun').Shell();

### Constructor

#### options

An optional object containing various options.

**cmdsDir (string)** - If specified then shotgun will use this directory to look for your command modules. Defaults to 'shotgun_cmds'.

**namespace (string)** - Identifies this shell instance. Particularly useful when shotgun-client is used to create browser consoles. Defaults to 'shotgun'.

**defaultModules (object)** - Any default command modules will appear as properties here and are set to 'true' by default. You can set any or all of them to false if needed and they will not load.

### Properties

**cmds (object)** - All loaded command modules appear as properties on this object. The property names are the names of the command modules. This is useful for finding out which command modules are loaded or specific information about a command module.

**namespace (string)** - If a namespace was specified then this property will be equal to that value. If it was not specified then it will be set to the command module directory by default.

### Methods

#### loadCommandModule(cmdPath:string)

This method allows you to explicitly load a command module by passing in a string path to the module file.

#### readCommandModules(dir:string)

This method allows you to explicitly load a directory containing command modules by passing in a string path (relative to application root) to the directory.

#### execute(cmdStr:string, context:object, options:object)

This is the main method for an instance of the shotgun shell.

**cmdStr** - The user's input. you don't have to do any extra parsing of this string before passing it in. Shotgun does all the parsing for you.

**context** - is an object that maintains state across each call to `shell.execute()`. The first time you call execute you can pass nothing or an empty object literal `{}`. This method returns a CommandResponse object; from that response object you can access a context object created by shotgun. On subsequent calls to `shell.execute()` you will want to pass in the context object found in the command response. Below is an example of executing a command that sets a context. In this case it asks the user for their username after typing login. The only way shotgun will know the next input passed in is the value for the username is if you also include the context it returns as part of the command response.

    var shell = new require('shotgun').Shell();
    var cmdResponse = shell.execute('login');
    cmdResponse = shell.execute('charlie', cmdResponse.context);

Hopefully you can see how this might be done in a loop where the user can continue supplying input.

**options** - The user is able to specify options in their input using the format `--option value` but you can override supplied options or pass in additional options by passing them in as properties on this options object.

    var cmdResponse = shell.execute('echo --iterations 5', {}, { iterations: 10 });
    // The echo command module will have 10 as the value of the iterations option instead of 5 as the user supplied.

---

## CommandResponse

    var commandResponse = shell.execute('echo "hello world"');

### Properties

**context (object)** - The context property contains information that shotgun will use on the next command execution, provided you pass it in to `shell.execute()`. This is how shotgun is able to prompt the user for values. It knows to use the next user input as value for the prompt because of the context object.

**lines (array)** - The lines array contains an array of line objects. A line object contains three properties: `options`, `type`, and `text`. Each line object describes a line of text that should be displayed to the user. Any application using shotgun will want to iterate over this array and display the value of the `text` property to the user. The `type` property will usually be one of three values: log, error, or warn. The `type` can be safely ignored but the application may choose to style different types of lines uniquely or prepend the line with something like "Error: " or "Warning: ". The `option` property contains other information to describe how the line of text should be displayed. Shotgun does not set any properties on this options object by itself. The command module that is adding the line to the lines array is responsible for adding any properties to this object that it chooses. Then the application using shotgun is responsible for reading those values and being able to understand them. For example, you could set a property called "bold" to true in your command module, and then in your application check the line options for that value and perform the necessary operations to make the text appear bold to the user.

    var res = shell.execute('echo "hello world"');
    res.lines.forEach(function (line) {
        var formatStr = '';
        if (line.options.bold) {
            formatStr = '** %s **';
        }
        console[line.type](formatStr, line.text);
    });
    // Given a line object like this: { options: { bold: true }, type: 'warn', text: 'hello world' }
    // the above code would essentially be doing this:
    // console.warn('** hello world **');

Notice that it's not really a coincidence that the three types of line objects (warn, error, and log) match methods on the `console` object.

### Methods

#### log(text:string, options:object)

This is a helper function for adding line objects to the lines array on the command response object. You can access this from within your command module and from your consuming application.

**text** - The line of text to be displayed.

**options** - Meta data that describes how the line of text should be displayed. The application is expected to understand any values added here, but values here are usually safely ignored if needed.

#### error(text:string, options:object)

This helper function is identical to log except it writes the value "error" to the `type` property.

#### warn(text:string, options:object)

This helper function is identical to log except it writes the value "warn" to the `type` property.

#### debug(text:string, options:object)

This helper function is identical to log except it writes the value "debug" to the `type` property.

#### setContext(cmdStr:string, contextMsg:string)

This helper function allows a command module to set a passive context. Any further input from the user will be appended to the supplied command string (`cmdStr`). The context message (`contextMsg`) is a simple string that sets a property on the context object. Nothing is really done with it, but some applications that consume shotgun like to display the context message to the left of the user input field to provide visual representation of the current context.

#### resetContext()

If a context has been set, calling this method will reset it.