module.exports = exports = function (res, options, cmd) {

    // If the command has pre-defined options then parse through them and validate against the supplied options.
    if (cmd.options) {

        var nonNamedIndex = 0;

        // Loop through the command's pre-defined options.
        for (var key in cmd.options) {

            // The option defined by the command.
            var definedOption = cmd.options[key];

            // If option has named=false, attach non-named parameters as option and remove from `options._` array.
            if (!(key in options) && definedOption.noName && options._.length > 0) {
                options[key] = options._[nonNamedIndex];
                options._.splice(nonNamedIndex, 1);
            }

            // If defined option was not supplied and it has aliases, check if aliases were supplied and attach option.
            if (!definedOption.noName && !(key in options) && definedOption.aliases) {
                definedOption.aliases.forEach(function (alias) {
                    if (alias in options) {
                        options[key] = options[alias];
                        delete options[alias];
                    }
                });
            }

            // Prompt the user for value if:
            // A) The option was not supplied and it is required.
            // B) The option was supplied but without a value.
            if (definedOption.prompt) {
                if ((!(key in options) && definedOption.required) || (key in options && options[key] === true)) {
                    res.context.prompt = {
                        option: key,
                        cmd: cmd.name,
                        options: options
                    };
                    if (definedOption.password)
                        res.password = true;
                    if (typeof(definedOption.prompt) !== 'boolean')
                        res.log(definedOption.prompt);
                    else
                        res.log('Enter value for ' + key + '.');
                    // Return immediately without further validation.
                    return false;
                }
            }

            // If option has default value and was not found in supplied options then assign it.
            if (definedOption.default && !(key in options))
                options[key] = definedOption.default;

            // If defined option has a validate expression or function and the option was supplied then
            // validate the supplied option against the expression or function.
            if (definedOption.validate && (key in options)) {

                // If defined validation is a regular expression then validate the supplied value against it.
                if (definedOption.validate instanceof RegExp) {
                    // If value does not pass validation then do not invoke command and write error message.
                    if (!definedOption.validate.test(options[key])) {
                        res.error('invalid value for "' + key + '"');
                        return false;
                    }
                }
                // If defined validation is a function then pass the value to it.
                else if (typeof(definedOption.validate) == 'function') {
                    try {
                        // If the validation function returns false then do not invoke the command and write
                        // error message.
                        var validationResult = definedOption.validate(options[key], options);
                        if (validationResult !== true) {
                            if (typeof(validationResult) !== 'string')
                                res.error('invalid value for "' + key + '"');
                            else
                                res.error(validationResult);
                            return false;
                        }
                    }
                        // If the provided validation function throws an error at any point then handle it
                        // gracefully and simply fail validation.
                    catch (ex) {
                        res.error('invalid value for "' + key + '"');
                        return false;
                    }
                }
            }

            // If option is required but is not found in supplied options then error.
            if (definedOption.required && !(key in options)) {
                res.error('missing parameter "' + key + '"');
                return false;
            }
        }
    }
    // If we made it this far then all options are valid so return true.
    return true;
}