var extend = require('extend'),
    shellHelpers = require('./utils/shellHelpers'),
    loadCommandModules = require('./utils/loadCommandModules'),
    execute = require('./utils/execute'),
    settings = require('./settings');

// Define the shell object.
module.exports.Shell = function (options) {

    // Alias 'this' so we can access in other scopes.
    var shell = this;

    // Extend default options with user supplied options.
    extend(true, settings, options);

    // Attach settings to shell.
    shell.settings = settings;

    // This property will store all the available command modules.
    shell.cmds = {};

    // Initialize shell helper methods.
    shellHelpers.registerShellMethods(shell);

    // Initialize command modules.
    loadCommandModules(shell);

    // Define the execute function that the application will call and pass in user input.
    shell.execute = execute;
};