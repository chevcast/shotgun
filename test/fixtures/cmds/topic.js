exports.description = 'Allows a user to view a topic on our pretend forum.';

exports.usage = '<id> [options]';

exports.options = {
    id: {
        nodash: true,
        required: true,
        description: 'The ID of the desired topic.'
    },
    reply: {
        aliases: ['r'],
        description: 'Specify to write a reply to the topic.'
    }
};

exports.invoke = function (res, options, shell) {
    if (!options.reply) {
        res.log('[topic ' + options.id + ' content]');
        res.setContext('topic ' + options.id);
    }
    else {
        res.prompt('Please write your reply.', 'reply', function (reply) {
            res.log('Your reply was: ' + reply);
        });
    }
};