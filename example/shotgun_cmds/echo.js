exports.description = 'Displays the supplied text for a specified number of times.';

exports.usage = '[options]';

exports.options = {
    message: {
        noName: true,
        required: true,
        description: 'The message to be displayed.',
        hidden: true
    },
    iterations: {
        aliases: ['i'],
        required: true,
        default: 1,
        description: 'The number of times to display the message.',
        validate: /^\d+$/
    }
};

exports.invoke = function (shell, options) {
    for (var count = 0; count < options.iterations; count++)
        shell.log(options.message);
};