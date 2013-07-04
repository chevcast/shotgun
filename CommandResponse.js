module.exports = exports = function (context) {

    var res = this;

    // Attach existing context object to response or create a new one.
    if (context)
        res.context = context;
    else
        res.context = {};

    // Create an array to store lines of text.
    res.lines = [];

    // Helper function to add simple lines of text to the res.lines array.
    res.log = function (text, options) {
        res.lines.push({
            options: options,
            type: 'log',
            text: text || ''
        });
    };

    // Helper function to add simple error text to the res.lines array.
    res.error = function (text, options) {
        res.lines.push({
            options: options,
            type: 'error',
            text: text || ''
        });
    };

    // Helper function to add simple warning text to the res.lines array.
    res.warn = function (text, options) {
        res.lines.push({
            options: options,
            type: 'warn',
            text: text || ''
        });
    };

    // Helper function for setting up passive contexts. If the user-provided command string matches a command
    // then it will ignore the passive context and execute the matching command. If it does not match a command
    // then it will append the provided string to the contexted string and re-execute.
    res.setContext = function (cmdStr, contextMsg) {
        res.context.passive = {
            cmdStr: cmdStr,
            msg: contextMsg || cmdStr
        };
    };

    // Helper function to reset contexts.
    res.resetContext = function () {
        res.context = {};
    };
};