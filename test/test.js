var should = require('chai').should(),
    shotgun = require('../index');

describe('Shotgun', function () {

    var shell;

    beforeEach(function () {
        shell = new shotgun.Shell({
            // Use example app's commands for these tests.
            cmdsDir: 'example/shotgun_cmds',
            loadNpmCmds: false
        });
    });

    describe('shell', function () {

        it('should invoke the onClearDisplay callback function.', function () {
            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('clearDisplay', true);
                })
                .execute('clear');
        });

        it('should invoke the onExit callback function.', function () {
            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('exit', true);
                })
                .execute('exit');
        });

        it('should print five lines to the display.', function () {
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
                .execute('echo test -i 5', { message: 'test override', iterations: 10 });

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

        it('should have the text printed from the echo command on all five lines.', function () {
            var lineCount = 0;

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'node is my fave');
                    lineCount++;
                })
                .execute('echo "node is my fave" -i 5');

            lineCount.should.equal(5);
        });

    });

    describe('prompt', function () {

        it('should prompt for required values if not supplied.', function () {
            var context = {},
                lineCount = 0;

            shell
                .setContextStorage(context)
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'Please enter your username.');
                    lineCount++;
                })
                .execute('login');

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
                .execute('charlie');

            lineCount.should.equal(2);

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'Welcome back charlie!');
                    lineCount++;
                })
                .execute('password123');

            lineCount.should.equal(3);
        });

        it('should not prompt for required values if supplied.', function () {
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

        it('should set password to true.', function () {
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

        it('should set a command context.', function () {
            var context = {};

            shell
                .setContextStorage(context)
                .execute('topic 123');
            should.exist(context);
            context.should.have.property('passive').with.property('cmdStr', 'topic 123');
        });

        it('should not send values to context command if input matches real command.', function () {
            var context = {},
                lineCount = 0;

            shell
                .setContextStorage(context)
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', '[topic 123 content]');
                    lineCount++;
                })
                .execute('topic 123');

            lineCount.should.equal(1);

            shell
                .onData(function (data) {
                    should.exist(data);
                    lineCount++;
                })
                .execute('help');

            lineCount.should.equal(9);
        });

        it('should send values to context command if input does not match real command.', function () {
            var context = {},
                lineCount = 0;

            shell
                .setContextStorage(context)
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', '[topic 123 content]');
                    lineCount++;
                })
                .execute('topic 123');

            lineCount.should.equal(1);
        });

        it('should prompt user for value if user supplies option with no value and prompt is enabled for that option.', function () {
            var context = {},
                lineCount = 0;

            shell
                .setContextStorage(context)
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', '[topic 123 content]');
                    lineCount++;
                })
                .execute('topic 123');

            lineCount.should.equal(1);

            shell
                .onData(function (data) {
                    should.exist(data);
                    data.should.have.property('line').with.property('text', 'Enter your reply.');
                    lineCount++;
                })
                .execute('-r');

            lineCount.should.equal(2);
        });

        it('should clear the context when clear command is issued.', function () {
            var context = {};

            shell
                .setContextStorage(context)
                .execute('topic 123');

            should.exist(context);
            context.should.have.property('passive').with.property('cmdStr', 'topic 123');

            shell.execute('clear');

            should.exist(context);
            context.should.not.have.property('passive');
        });

    });

});