var fs = require('fs'),
    path = require('path'),
    format = require('./format'),
    extend = require('extend');

exports.loadHelpers = function (shell) {

    // Clear display helper function.
    shell.clear = function () {
        shell.emit('clear');
        return shell;
    };

    // Exit helper function.
    shell.exit = function () {
        shell.emit('exit');
        return shell;
    };

    // Password helper function.
    shell.password = function () {
        shell.emit('password');
        return shell;
    };

    // Log helper function.
    shell.log = function (text, options) {
        options = extend({ type: 'log' }, options);
        shell.emit('log', text ? text.toString() : '', options);
        return shell;
    };

    // Error helper function.
    shell.error = function (err) {
        if (shell.listeners('error').length > 0 || shell.listenersAny().length > 0)
            shell.emit('error', err);
        else
            throw err;
        return shell;
    };

    // Edit helper function.
    shell.edit = function (text) {
        shell.emit('edit', text);
        return shell;
    };

    // Shell context API. Easily overridden if needed.
    shell.context = {
        data: {},
        setVar: function (name, value) {
            var operation = this.data.hasOwnProperty(name) ? 'update' : 'add';
            this.data[name] = value;
            shell.emit('contextChanged', this.data, {
                operation: operation,
                name: name,
                value: value
            });
        },
        getVar: function (name, callback) {
            return this.data[name];
        },
        delVar: function (name) {
            delete this.data[name];
            shell.emit('contextChanged', this.data, {
                operation: 'delete',
                name: name,
            });
        }
    };

    shell.setPrompt = function(key, cmdName, options, msg) {
        return shell.context.setVar('prompt', {
            option: key,
            cmd: cmdName,
            options: options,
            msg: msg || key
        });
    };

    shell.clearPrompt = function () {
        shell.context.delVar('prompt');
    };

    // Load these down below so they don't clutter.
    commandModuleLoadingFunctions(shell);
};

// Define the rather large loadCommandModule function separately so it doesn't clutter up above.
function commandModuleLoadingFunctions(shell) {

    // Register a new command module.
    shell.registerCmd = function () {
        var cmd, cmdName;
        switch (arguments.length) {
            case 1:
                cmd = arguments[0];
                cmdName = cmd.name.toLowerCase();
                break;
            case 2:
                cmdName = arguments[0].toLowerCase();
                cmd = arguments[1];
                cmd.name = cmdName;
                break;
            default:
                return shell.error("You must supply a cmd module to registerCmd.");
        }
        if (cmd && cmd.invoke) {
            if (cmd.hasOwnProperty('options')) {
                for (var key in cmd.options) {
                    if (cmd.options.hasOwnProperty(key)) {
                        var definedOption = cmd.options[key];
                        if (definedOption.hasOwnProperty('aliases'))
                            if (typeof definedOption.aliases === 'string')
                                definedOption.aliases = definedOption.aliases.toString().replace(/, /, ',').split(',');
                    }
                }
            }
            if (typeof cmd.access === 'undefined') {
                if (typeof shell.settings.defaultCmdAccess === 'boolean') {
                    var defaultCmdAccess = shell.settings.defaultCmdAccess;
                    cmd.access = function () { return defaultCmdAccess; };
                } else
                    cmd.access = shell.settings.defaultCmdAccess;
            }
            else if (typeof cmd.access === 'boolean') {
                var access = cmd.access;
                cmd.access = function () { return access; };
            }
            shell.cmds[cmdName] = cmd;
        } else if (shell.settings.debug)
            shell.error(format("{0} is not a valid shotgun command module and was not loaded.", cmdPath));
    };

    // Register multiple command modules at once.
    shell.registerCmds = function (cmds) {
        for (var cmdName in cmds) {
            if (!cmds.hasOwnProperty(cmdName)) return;
            shell.registerCmd(cmdName, cmds[cmdName]);
        }
    };

    // Locate and load the specified command module into shell.cmds.
    shell.loadCommandModule = function (cmdPath) {
        try {
            var stats = fs.statSync(cmdPath);
            if (stats) {
                if (path.extname(cmdPath).toLowerCase() === '.js' || stats.isDirectory()) {
                    var cmd = require(cmdPath);
                    var cmdName = path.basename(cmdPath, '.js').toLowerCase().replace(/^shotguncmd-/i, "");
                    shell.registerCmd(cmdName, cmd);
                }
            }
        } catch (err) {
            if (shell.settings.debug)
                shell.error(format("{0} failed to load with exception: {1}", cmdPath, err.message));
        }
        return shell;
    };

    // Locate and load all command modules within a directory.
    shell.loadCommandModules = function(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir);
            if (files) {
                files.forEach(function (file) {
                    shell.loadCommandModule(path.resolve(dir, file));
                });
            }
        }
        return shell;
    };
}
