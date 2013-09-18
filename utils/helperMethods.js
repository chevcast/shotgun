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
    };

    // Default helper functions.
    shell.send = function () {
        if (shell.settings.debug)
            console.error("No data handler has been set. Use \"shell.onData(callback)\" to set one.");
    };

    // Create a generic data callback.
    shell.onData = function (callback) {
        shell.send = callback;
        return shell;
    };

    // Clear display helper function.
    shell.clearDisplay = function () {
        shell.send({ clearDisplay: true });
    };

    // Exit helper function.
    shell.exit = function () {
        shell.send({ exit: true });
    };

    // Password helper function.
    shell.password = function () {
        shell.send({ password: true });
    };

    // Log helper functions.
    shell.log = function (text, options) {
        shell.send({
            line: {
                options: options || {},
                type: 'log',
                text: text ? text.toString() : ''
            }
        });
    };
    shell.warn = function (text, options) {
        shell.send({
            line: {
                options: options || {},
                type: 'warn',
                text: text ? text.toString() : ''
            }
        });
    };
    shell.error = function (text, options) {
        shell.send({
            line: {
                options: options || {},
                type: 'error',
                text: text ? text.toString() : ''
            }
        });
    };
    shell.debug = function (text, options) {
        shell.send({
            line: {
                options: options || {},
                type: 'debug',
                text: text ? text.toString() : ''
            }
        });
    };

    // Create context helper functions. Callback is invoked anytime the context changes and is optional.
    var contextCallback;
    shell.onContext = function (callback) {
        contextCallback = callback;
        return shell;
    };
    shell.setContext = function (context) {
        shell.context = context;
        if (contextCallback) contextCallback(shell.context);
        return shell;
    };
    shell.setPassive = function (cmdStr, msg) {
        shell.context.passive = {
            cmdStr: cmdStr,
            msg: msg || cmdStr
        };
        if (contextCallback) contextCallback(shell.context);
    };
    shell.setPrompt = function(key, cmdName, options) {
        shell.context.prompt = {
            option: key,
            cmd: cmdName,
            options: options
        };
        if (contextCallback) contextCallback(shell.context);
    };
    shell.clearPrompt = function () {
        if (shell.context.hasOwnProperty('prompt'))
            delete shell.context.prompt;
        if (contextCallback) contextCallback(shell.context);
    };
    shell.clearPassive = function () {
        if (shell.context.hasOwnProperty('passive'))
            delete shell.context.passive;
        if (contextCallback) contextCallback(shell.context);
    };
}