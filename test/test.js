var should = require('chai').should(),
    shotgun = require('../index');

describe('Shotgun', function () {
    var shell = new shotgun.Shell('test/fixtures/cmds');

    describe('shell', function () {

        it('should set clearDisplay to true', function () {
            var result = shell.execute('clear');
            should.exist(result);
            result.should.have.property('clearDisplay', true);
        });

        it('should set exit to true', function () {
            var result = shell.execute('exit');
            should.exist(result);
            result.should.have.property('exit', true);
        });

        it('should contain an array with five line objects.', function () {
            var result = shell.execute('echo "she sells sea shells down by the seashore" -i 5');
            should.exist(result);
            result.should.have.property('lines').with.length(5);
            for (var count = 0; count < 5; count++) {
                should.exist(result.lines[count]);
                result.lines[count].should.have.property('text', 'she sells sea shells down by the seashore');
            }
        });

        it('should override user supplied options if options are passed in manually.', function () {
            var result = shell.execute('echo test -i 5', {}, { message: 'test override', iterations: 10 });
            should.exist(result);
            result.should.have.property('lines').with.length(10);
            result.lines[9].should.have.property('text', 'test override');
        });

        it('should display an error when parameter fails to pass validation.', function () {
            var result = shell.execute('echo test -i chicken');
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'error');
        });

        it('should display an error when a required parameter is not supplied.', function () {
            var result = shell.execute('echo');
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'error');
        });

        it('should have the text printed from the echo command on all five lines.', function () {
            var result = shell.execute('echo "node is my fave" -i 5');
            should.exist(result);
            result.should.have.property('lines').with.length(5);
            for (var count = 0; count < 5; count++) {
                result.lines[count].should.have.property('text', 'node is my fave');
            }
        });

    });

    describe('prompt', function () {

        it('should prompt for username and password if not supplied.', function () {
            var result = shell.execute('login');
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'log');
            result.lines[0].should.have.property('text', 'Enter value for username.');
            result = shell.execute('charlie', result.context);
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'log');
            result.lines[0].should.have.property('text', 'Enter value for password.');
            result = shell.execute('password123', result.context);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'log');
            result.lines[0].should.have.property('text', 'Success!');
        });

        it('should not prompt for username or password if supplied.', function () {
            var result = shell.execute('login charlie password123');
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'log');
            result.lines[0].should.have.property('text', 'Success!');
        });

        it('should set password to true.', function () {
            var result = shell.execute('login charlie');
            should.exist(result);
            result.should.have.property('password', true);
        });

    });

    describe('context', function () {

        it('should set a command context.', function () {
            var result = shell.execute('topic 123');
            should.exist(result);
            result.should.have.property('context').with.property('passive').with.property('cmdStr', 'topic 123');
        });

        it('should not send values to context command if input matches real command.', function () {
            var result = shell.execute('topic 123');
            should.exist(result);
            result = shell.execute('help', result.context);
            should.exist(result);
            result.should.have.property('lines').with.length(8);
        });

        it('should send values to context command if input does not match real command.', function () {
            var result = shell.execute('topic 123');
            should.exist(result);
            result = shell.execute('-r "this is my reply"', result.context);
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'log');
            result.lines[0].should.have.property('text', 'Your reply was: this is my reply');
        });

        it('should prompt user for value if user supplies option with now value.', function () {
            var result = shell.execute('topic 123');
            should.exist(result);
            result = shell.execute('-r', result.context);
            should.exist(result);
            result.should.have.property('lines').with.length(1);
            result.lines[0].should.have.property('type', 'log');
            result.lines[0].should.have.property('text', 'Enter your reply.');
        });

        it('should clear the context when clear command is issued.', function () {
            var result = shell.execute('topic 123');
            should.exist(result);
            result.should.have.property('context').with.property('passive').with.property('cmdStr', 'topic 123');
            result = shell.execute('clear', result.context);
            should.exist(result);
            result.should.have.property('context').not.with.property('passive');
        });

    });

});