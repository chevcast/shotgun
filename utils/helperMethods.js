var fs = require('fs'),
    path = require('path');

module.exports = exports = function (shell) {
    // Load specified command module into shell.cmds.
    shell.loadCommandModule = function(cmdPath) {
        try {
            var cmd = require(cmdPath);
            var cmdName = path.basename(cmdPath, '.js').toLowerCase().replace(/^shotguncmd-/i, "");
            if (cmd && cmd.invoke) {
                cmd.name = cmdName.toLowerCase();
                shell.cmds[cmdName] = cmd;
            }
            else if (shell.settings.debug)
                console.warn("%s is not a valid shotgun command module and was not loaded.", cmdPath);
        } catch (ex) {
            if (shell.settings.debug)
                console.error(ex.message);
        }
        return shell;
    };

    // Reads all command modules from the specified directory and loads them.
    shell.readCommandModules = function(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir);
            if (files)
                files.forEach(function (file) {
                    shell.loadCommandModule(path.resolve(dir, file));
                });
        }
        return shell;
    };

    // Default helper functions.
    shell.send = function () {
        if (shell.settings.debug)
            console.error("No data handler has been set. Use \"shell.onData(callback)\" to set one.");
        return shell;
    };

    // Create a generic data callback.
    shell.onData = function (callback) {
        shell.send = function (data) {
            callback(data);
            return shell;
        };
        return shell;
    };

    // Clear display helper function.
    shell.clearDisplay = function () {
        return shell.send({ clearDisplay: true });
    };

    // Exit helper function.
    shell.exit = function () {
        return shell.send({ exit: true });
    };

    // Password helper function.
    shell.password = function () {
        return shell.send({ password: true });
    };

    // Log helper functions.
    shell.log = function (text, options) {
        return shell.send({
            line: {
                options: options || {},
                type: 'log',
                text: text ? text.toString() : ''
            }
        });
    };
    shell.warn = function (text, options) {
        return shell.send({
            line: {
                options: options || {},
                type: 'warn',
                text: text ? text.toString() : ''
            }
        });
    };
    shell.error = function (text, options) {
        return shell.send({
            line: {
                options: options || {},
                type: 'error',
                text: text ? text.toString() : ''
            }
        });
    };
    shell.debug = function (text, options) {
        return shell.send({
            line: {
                options: options || {},
                type: 'debug',
                text: text ? text.toString() : ''
            }
        });
    };

    // Create context helper functions. Callback is invoked anytime the context changes and is optional.
    var contextChangedCallback = function () {
        if (shell.settings.debug)
            console.error("No context handler has been set. Use \"shell.onContext(callback)\" to set one.");
        return shell;
    };
    shell.modifyContext = function (callback) {
        callback(shell.context);
        return contextChangedCallback();
    };

    shell.onContextChanged = function (callback) {
        contextChangedCallback = function () {
            callback(shell.context);
            return shell;
        };
        return shell;
    };
    shell.setContext = function (newContext) {
        shell.context = newContext;
        return contextChangedCallback();
    };
    shell.setPassive = function (cmdStr, msg) {
        return shell.modifyContext(function (context) {
            context.passive = {
                cmdStr: cmdStr,
                msg: msg || cmdStr
            };
        });
    };
    shell.setPrompt = function(key, cmdName, options) {
        return shell.modifyContext(function (context) {
            context.prompt = {
                option: key,
                cmd: cmdName,
                options: options
            };
        });
    };
    shell.clearPrompt = function () {
        return shell.modifyContext(function (context) {
            if (context.hasOwnProperty('prompt'))
                delete context.prompt;
        });
    };
    shell.clearPassive = function () {
        return shell.modifyContext(function (context) {
            if (context.hasOwnProperty('passive'))
                delete context.passive;
        });
    };
};