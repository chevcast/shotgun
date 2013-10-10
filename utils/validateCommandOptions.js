module.exports = exports = function (options, cmd, shell) {
    // If the command has pre-defined options then parse through them and validate against the supplied options.
    if (cmd.options) {

        var nonNamedIndex = 0;

        // Loop through the command's pre-defined options.
        for (var key in cmd.options) {

            // The option defined by the command.
            var definedOption = cmd.options[key];

            // If noName:false, attach non-named parameters as option and remove from `options._` array.
            if (!options.hasOwnProperty(key) && definedOption.noName && options._.length > 0) {
                options[key] = options._[nonNamedIndex];
                options._.splice(nonNamedIndex, 1);
            }

            // If defined option was not supplied and it has aliases, check if aliases were supplied and attach option.
            if (!definedOption.hasOwnProperty('noName') && !options.hasOwnProperty(key)
                && definedOption.hasOwnProperty('aliases')) {
                var aliases = definedOption.aliases;
                if (typeof(aliases) === 'string')
                    aliases = aliases.toString().replace(/, /, ',').split(',');
                aliases.forEach(function (alias) {
                    if (alias in options) {
                        options[key] = options[alias];
                        delete options[alias];
                    }
                });
            }

            // Hook for additional defined options logic that can be passed in.
            if (shell.settings.parseOptions) shell.settings.parseOptions(key, options, cmd, shell);

            // If option has default value and was not found in supplied options then assign it.
            if (definedOption.hasOwnProperty('default') && !options.hasOwnProperty(key)) {
                switch (typeof(definedOption.default)) {
                    case 'function':
                        options[key] = definedOption.default(shell, options);
                        break;
                    default:
                        options[key] = definedOption.default;
                        break;
                }
            }

            // If prompt is enabled then prompt the user for a value if:
            // A) The option was not supplied and it is required or
            // B) the option was supplied but without a value.
            if (definedOption.hasOwnProperty('prompt')) {
                if (!options.hasOwnProperty(key)&& definedOption.required
                    || options.hasOwnProperty(key) && options[key] === true) {
                    shell.setPrompt(key, cmd.name, options);
                    if (definedOption.password)
                        shell.password();
                    if (typeof(definedOption.prompt) !== 'boolean')
                        shell.log(definedOption.prompt);
                    else
                        shell.log('Enter value for ' + key + '.');
                    // Return immediately without further validation.
                    return false;
                }
            }

            // If defined option has a validate expression or function and the option was supplied then
            // validate the supplied option against the expression or function.
            if (definedOption.hasOwnProperty('validate') && options.hasOwnProperty(key)) {

                // If defined validation is a regular expression then validate the supplied value against it.
                if (definedOption.validate instanceof RegExp) {
                    // If value does not pass validation then do not invoke command and write error message.
                    if (!definedOption.validate.test(options[key])) {
                        shell.error('invalid value for "' + key + '"');
                        return false;
                    }
                }
                // If defined validation is a function then pass the value to it.
                else if (typeof(definedOption.validate) == 'function') {
                    try {
                        // If the validation function returns false then do not invoke the command and write
                        // error message.
                        var validationResult = definedOption.validate(options[key], shell, options);
                        if (validationResult !== true) {
                            if (typeof(validationResult) !== 'string')
                                shell.error('invalid value for "' + key + '"');
                            else
                                shell.error(validationResult);
                            return false;
                        }
                    }
                        // If the provided validation function throws an error at any point then handle it
                        // gracefully and simply fail validation.
                    catch (ex) {
                        shell.error(ex.message);
                        return false;
                    }
                }
            }

            // If option is required but is not found in supplied options then error.
            if (definedOption.hasOwnProperty('required') && !options.hasOwnProperty(key)) {
                shell.error('missing parameter "' + key + '"');
                return false;
            }
        }
    }
    // If we made it this far then all options are valid so return true.
    return true;
};