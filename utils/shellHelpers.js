var fs = require('fs'),
    path = require('path'),
    context = {};

exports.updateContext = function (newContext) {
    context = newContext;
};

exports.registerShellMethods = function (shell) {
    // Load specified command module into shell.cmds.
    shell.loadCommandModule = function(cmdPath) {
        try {
            var stats = fs.statSync(cmdPath);
            if (stats) {
                if (path.extname(cmdPath).toLowerCase() === '.js' || stats.isDirectory()) {
                    var cmd = require(cmdPath);
                    var cmdName = path.basename(cmdPath, '.js').toLowerCase().replace(/^shotguncmd-/i, "");
                    if (cmd && cmd.invoke) {
                        cmd.name = cmdName.toLowerCase();
                        shell.cmds[cmdName] = cmd;
                    }
                    else if (shell.settings.debug)
                        console.warn("%s is not a valid shotgun command module and was not loaded.", cmdPath);
                }
            }
        } catch (ex) {
            if (shell.settings.debug)
                console.error("%s failed to load with exception: %s", cmdPath, ex.message);
        }
        return shell;
    };

    // Loads all command modules from the specified directory and loads them.
    shell.loadCommandModules = function(dir) {
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
    var saveContext = shell.send = function () {
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
    shell.clearDisplay = function (resetContext) {
        if (resetContext) shell.resetContext();
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

    shell.onContextSave = function (callback) {
        saveContext = function () {
            callback(context);
            return shell;
        };
        return shell;
    };
    shell.setVar = function (key, value) {
        context[key] = value;
        return saveContext();
    };
    shell.getVar = function (key) {
        return context[key];
    };
    shell.delVar = function (key) {
        if (!context.hasOwnProperty(key))
            return;
        delete context[key];
        return saveContext();
    };
    shell.setPrompt = function(key, cmdName, options, msg) {
        context.prompt = {
            option: key,
            cmd: cmdName,
            options: options,
            msg: msg || key
        };
        return saveContext();
    };
    shell.clearPrompt = function () {
        if (!context.hasOwnProperty('prompt'))
            return
        delete context.prompt;
        return saveContext();
    };
    shell.resetContext = function() {
        context = {};
        return saveContext();
    }
};