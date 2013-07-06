exports.description = 'Allows a user to authenticate to the system with the supplied credentials.';

exports.usage = '[username] [password]';

exports.options = {
    username: {
        prompt: true,
        required: true,
        noName: true,
        description: 'Your username.'
    },
    password: {
        password: true,
        prompt: true,
        required: true,
        noName: true,
        description: 'Your password.'
    }
};

exports.invoke = function (options, shell) {
    var res = this;
    if (options.username.toLowerCase() === 'charlie' && options.password === 'password123')
        res.log('Success!');
    else
        res.error('Username or password incorrect.');
};