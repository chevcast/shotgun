exports.description = 'Displays the supplied text for a specified number of times.';

exports.usage = '[options]';

exports.options = {
	message: {
		aliases: null,
		required: true,
		description: 'The message to be displayed.'
	},
	iterations: {
		aliases: ['i, iterations'],
		required: true,
		default: 1,
		description: 'The number of times to display the message.',
		validate: /^\d+$/
	}
};

exports.invoke = function (res, options, shell) {
	for (var count = 0; count < options.iterations; count++)
		res.writeLine(options.message);
};