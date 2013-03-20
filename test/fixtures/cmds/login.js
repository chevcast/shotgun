exports.description = 'Allows a user to authenticate to the system with the supplied credentials.';

exports.usage = '[username] [password]';

exports.options = {
    username: {
        nodash: true,
        description: 'Your username.'
    },
    password: {
        nodash: true,
        description: 'Your password.'
    }
};

exports.invoke = function (res, options, shell) {
    res.prompt('Please enter your username.', 'username', function (username) {
        res.prompt('Please enter your password.', 'password', function (password) {
            if (username.toLowerCase() === 'charlie' && password === 'password123')
                res.log('Success!');
            else
                res.error('Username or password incorrect.');
        });
    });
};