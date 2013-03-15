exports.options = [
	{
		name: 'message',
		aliases: null,
		required: true,
		description: 'The message to be displayed.',
		type: 'requiredValue'
	},
	{
		name: 'iterations',
		aliases: 'i,itr',
		required: false,
		default: 1,
		description: 'Reprints the message for the specified number of iterations.'
	}
];

exports.description = 'Displays the supplied message.';

exports.help = function (res, options) {
	res.writeLine('Echo takes a message and displays it. If the optional [iterations] parameter is supplied it will print the message for the specified number of lines.');
};

exports.invoke = function (res, args, options) {
	var iterations = args.iterations || 1;
	for (var count = 0; count < iterations; count++) {
		res.writeLine(args.message);
	}
};