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
        var options = extend({ type: 'log' }, options);
        shell.emit('log', text ? text.toString() : '', options);
        return shell;
    };

    // Error helper function.
    shell.error = function (err) {
        if (shell.listeners('error').length > 0)
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
            this.data[name] = value;
            shell.emit('contextChanged', this.data);
        },
        getVar: function (name, callback) {
            callback(this.data[name]);
        },
        delVar: function (name) {
            delete this.data[name];
            shell.emit('contextChanged', this.data);
        }
    };

    shell.setPrompt = function(key, cmdName, options, msg) {
        var prompt = {
            option: key,
            cmd: cmdName,
            options: options,
            msg: msg || key
        };
        return shell.context.setVar('prompt', prompt);
    };

    shell.clearPrompt = function () {
        shell.context.delVar('prompt');
    };

    // Load these down below so they don't clutter.
    commandModuleLoadingFunctions(shell);
};

// Define the rather large loadCommandModule function separately so it doesn't clutter up above.
function commandModuleLoadingFunctions(shell) {
    // Load specified command module into shell.cmds.
    shell.loadCommandModule = function (cmdPath) {
        try {
            var stats = fs.statSync(cmdPath);
            if (stats) {
                if (path.extname(cmdPath).toLowerCase() === '.js' || stats.isDirectory()) {
                    var cmd = require(cmdPath);
                    var cmdName = path.basename(cmdPath, '.js').toLowerCase().replace(/^shotguncmd-/i, "");
                    if (cmd && cmd.invoke) {
                        if (!cmd.hasOwnProperty('name'))
                            cmd.name = cmdName.toLowerCase();
                        else
                            cmdName = cmd.name;
                        if (cmd.hasOwnProperty('options')) {
                            for (var key in cmd.options) {
                                if (cmd.options.hasOwnProperty(key)) {
                                    var definedOption = cmd.options[key];
                                    if (definedOption.hasOwnProperty('aliases'))
                                        if (typeof(definedOption.aliases) === 'string')
                                            definedOption.aliases = definedOption.aliases.toString().replace(/, /, ',').split(',');
                                }
                            }
                        }
                        if (typeof(cmd.access) === 'undefined') {
                            if (typeof(shell.settings.defaultCmdAccess) === 'boolean') {
                                var defaultCmdAccess = shell.settings.defaultCmdAccess;
                                cmd.access = function () { return defaultCmdAccess; };
                            }
                            else
                                cmd.access = shell.settings.defaultCmdAccess;
                        }
                        else if (typeof(cmd.access) === 'boolean') {
                            var access = cmd.access;
                            cmd.access = function () { return access; };
                        }
                        shell.cmds[cmdName] = cmd;
                    }
                    else if (shell.settings.debug)
                        shell.error(format("{0} is not a valid shotgun command module and was not loaded.", cmdPath));
                }
            }
        } catch (err) {
            if (shell.settings.debug)
                shell.error(format("{0} failed to load with exception: {1}", cmdPath, err.message));
        }
        return shell;
    };

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
}
