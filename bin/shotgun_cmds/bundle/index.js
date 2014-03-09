var fs = require('fs');
var path = require('path');

// A short description of what this command module does. Displayed in help.
exports.description = "Creates a bundle containing your custom command modules.";

// A string representing how the command should be used.
exports.usage = "<path> [options]";

// The options this command understands.
exports.options = {
    directory: {
        noName: true,
        required: true,
        prompt: "Enter a path to a command module or directory of command modules.",
        default: 'shotgun_cmds',
        validate: function (path) {
            return fs.existsSync(path) && fs.statSync(path).isDirectory() ? true : 'Path does not exist or is not a directory.';
        }
    },
    output: {
        aliases: 'o'
    }
};

// The function that should run when the command is invoked.
exports.invoke = function (shell, options) {
    var dir = options.directory;
    if (fs.existsSync(dir)) {
        var files = fs.readdirSync(dir);
        if (files) {
            var cmdModules = [];
            files.forEach(function (file) {
                var cmdPath = path.resolve(dir, file);
                var stats = fs.statSync(cmdPath);
                if (stats) {
                    if (path.extname(cmdPath).toLowerCase() === '.js' || stats.isDirectory()) {
                        var cmdName = path.basename(cmdPath, '.js').toLowerCase().replace(/^shotguncmd-/i, "");
                        cmdModules.push('"' + cmdName + '": require("' + cmdPath + '")');
                    }
                }
            });
            var outStream = process.stdout;
            if (options.hasOwnProperty('output'))
                outStream = fs.createWriteStream(options.output);
            outStream.write("module.exports = {" + cmdModules.join(',') + "};");
            //fs.unlinkSync(tempFile);
        }
    } else
        shell.error('The specified path does not exist.');
};

