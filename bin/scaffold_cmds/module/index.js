var fs = require('fs'),
    path = require('path');

exports.description = "Generates a shotgun command module scaffold at the specified path.";

exports.usage = "<path>";

exports.options = {
    path: {
        noName: true,
        required: true,
        prompt: "Enter the path where the command module should be generated.",
        description: 'The path where the command should be generated.'
    },
    description: {
        required: true,
        prompt: "Enter a short description of the command. This string shows in the help menu.",
        description: "A short description of the generated command module."
    },
    usage: {
        required: true,
        prompt: "Enter a simple usage string for your command. For example, if your command had a required message option with noName:true and various optional options your usage string might looke like this: \"<message> [options]\".",
        description: "A usage string to help users properly use your command."
    }
};

exports.invoke = function (shell, options) {
    shell.log("Reading in command module template...");
    fs.readFile(path.join(__dirname, 'templates', 'basic.txt'), function (err, data) {
        if (err) return shell.error(err);
        shell.log("Done!");
        shell.log("Populating template with supplied data...");
        data = data.toString()
            .replace('{{description}}', options.description)
            .replace('{{usage}}', options.usage);
        shell.log("Writing command module template to " + options.path);
        fs.writeFile(options.path, data, function (err) {
            if (err) return shell.error(err);
            shell.log("Done!");
        });
    });
};
