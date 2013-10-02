exports.description = "Allows the user to sign in with their username and password.";

exports.usage = "[username] [password]";

var usernameValid = true;

exports.options = {
    username: {
        noName: true,
        required: true,
        prompt: "Please enter your username.",
        validate: function (username) {
            usernameValid = username.toLowerCase() === 'charlie';
            return true;
        },
        hidden: true
    },
    password: {
        noName: true,
        required: true,
        prompt: "Please enter your password.",
        validate: function (password, options) {
            if (!usernameValid || password !== 'password123')
                return "Invalid password.";
            return true;
        },
        hidden: true,
        password: true
    }
};

exports.invoke = function (shell, options) {
    shell.log('Welcome back ' + options.username + '!');
};