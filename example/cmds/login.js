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

exports.invoke = function (options, shell) {
    var res = this;
    res.log('Please enter your credentials.');
    res.prompt('Username:', 'username', function (username) {
        var res = this;
        res.password = true;
        res.prompt('Password:', 'password', function (password) {
            var res = this;
            res.password = false;
            if (options.username.toLowerCase() === 'charlie' && password === 'password123')
                res.log('Success!');
            else
                res.error('Username or password incorrect.');
        });
    });
};