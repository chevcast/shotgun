var extend = require('extend'),
    shellHelpers = require('./utils/shellHelpers'),
    loadCommandModules = require('./utils/loadCommandModules'),
    execute = require('./utils/execute'),
    defaultSettings = require('./settings');

// Define the shell object.
module.exports.Shell = function (options) {

    // Alias 'this' so we can access in other scopes.
    var shell = this;

    // Attach settings to shell.
    shell.settings = extend(true, {}, defaultSettings, options);;

    // This property will store all the available command modules.
    shell.cmds = {};

    // Initialize shell helper methods.
    shellHelpers.registerShellMethods(shell);

    // Initialize command modules.
    loadCommandModules(shell);

    // Define the execute function that the application will call and pass in user input.
    shell.execute = execute;
};