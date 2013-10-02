var should = require('chai').should(),
    shotgun = require('../index'),
    path = require('path');

describe('Shotgun', function () {

    var shell;

    beforeEach(function () {
        shell = new shotgun.Shell({
            // Use example app's commands for these tests.
            cmdsDir: path.join(__dirname, '..', 'example', 'shotgun_cmds'),
            loadNpmCmds: false
        });
    });

    describe('shell', function () {

        it('should send clearDisplay:true when clear command is run.', function () {
            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('clearDisplay', true);
                })
                .execute('clear');
        });

        it('should send exit:true when exit command is run.', function () {
            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('exit', true);
                })
                .execute('exit');
        });

        it('should understand command line options passed by the user.', function () {
            var lineCount = 0;

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'she sells sea shells down by the seashore');
                    lineCount++;
                })
                .execute('echo "she sells sea shells down by the seashore" -i 5');

            lineCount.should.equal(5);
        });

        it('should override user supplied options if options are passed in manually.', function () {
            var lineCount = 0;

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'test override');
                    lineCount++;
                })
                .execute('echo test -i 5', null, { message: 'test override', iterations: 10 });

            lineCount.should.equal(10);
        });

        it('should display an error when parameter fails to pass validation.', function () {
            var lineCount = 0;

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('type', 'error');
                    lineCount++;
                })
                .execute('echo test -i chicken');

            lineCount.should.equal(1);
        });

        it('should display an error when a required parameter is not supplied.', function () {
            var lineCount = 0;

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('type', 'error');
                    lineCount++;
                })
                .execute('echo');

            lineCount.should.equal(1);
        });

        it('should ask user for value if the option is required, prompt was set, and user did not supply a value.', function () {
            var context = {},
                lineCount = 0;

            shell
                .onContextSave(function (updatedContext) {
                    context = updatedContext;
                })
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'Please enter your username.');
                    lineCount++;
                })
                .execute('login', context);

            lineCount.should.equal(1);

            shell
                .onData(function (data) {
                    should.exist(data);
                    if (data.hasOwnProperty('password'))
                        data.should.have.property('password', true);
                    else {
                        data.should.have.property('line').with.property('text', 'Please enter your password.');
                        lineCount++;
                    }
                })
                .execute('charlie', context);

            lineCount.should.equal(2);

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'Welcome back charlie!');
                    lineCount++;
                })
                .execute('password123', context);

            lineCount.should.equal(3);
        });

        it('should not prompt user for value if the option is required and prompt was set, but the user already supplied a value for that option.', function () {
            var lineCount = 0;

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'Welcome back charlie!');
                    lineCount++;
                })
                .execute('login charlie password123');

            lineCount.should.equal(1);
        });

        it('should send password:true when an option specifies it is a password value and prompt is set.', function () {
            shell
                .onData(function (data) {
                    should.exist(data);
                    if (data.hasOwnProperty(('password')))
                        data.should.have.property('password', true);
                })
                .execute('login charlie');
        });

    });

    describe('context', function () {

        it('should contain a custom variable when the command module calls the shell.setVar helper method.', function () {
            var context = {};

            shell
                .onContextSave(function (updatedContext) {
                    context = updatedContext;
                })
                .execute('topic 123', context);

            should.exist(context);
            context.should.have.property('recentTopic', 123);
        });

        it ('should reset if shell.clearDisplay(true) is called.', function () {
            var context = {};

            shell
                .onContextSave(function (updatedContext) {
                    context = updatedContext;
                })
                .execute('login', context);

            should.exist(context);
            context.should.have.property('prompt').with.property('cmd', 'login');

            shell.clearDisplay(true);

            should.exist(context);
            context.should.not.have.property('prompt');
        });

    });

});