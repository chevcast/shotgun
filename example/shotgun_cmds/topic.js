exports.description = 'Allows a user to view a topic on our pretend forum.';

exports.usage = '<id> [options]';

exports.options = {
    id: {
        noName: true,
        required: true,
        description: 'The ID of the desired topic.'
    }
};

exports.invoke = function (shell, options) {
    shell.setVar('recentTopic', options.id);
    shell.log('[topic ' + options.id + ' content]');
};