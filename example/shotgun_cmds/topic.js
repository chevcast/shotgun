exports.description = 'Allows a user to view a topic on our pretend forum.';

exports.usage = '<id> [options]';

exports.options = {
    id: {
        noName: true,
        required: true,
        description: 'The ID of the desired topic.'
    },
    reply: {
        prompt: 'Enter your reply.',
        aliases: ['r'],
        description: 'Specify to write a reply to the topic.'
    }
};

exports.invoke = function (options, shell) {
    if (!options.reply) {
        shell.setPassive('topic ' + options.id);
        shell.log('[topic ' + options.id + ' content]');
    }
    else {
        shell.log('Your reply was: ' + options.reply.replace(/\n/g, ""));
    }
};