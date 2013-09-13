var should = require('chai').should(),
    shotgun = require('../index');

describe('Shotgun', function () {
    var shell = new shotgun.Shell({
        // Use example app's commands for these tests.
        cmdsDir: 'example/shotgun_cmds',
        loadNpmCmds: false
    });

    describe('shell', function () {

        it('should set clearDisplay to true', function (done) {
            shell.execute('clear', function (result) {
                should.exist(result);
                result.should.have.property('clearDisplay', true);
                done();
            });
        });

        it('should set exit to true', function (done) {
            shell.execute('exit', function (result) {
                should.exist(result);
                result.should.have.property('exit', true);
                done();
            });
        });

        it('should contain an array with five line objects.', function (done) {
            shell.execute('echo "she sells sea shells down by the seashore" -i 5', function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(5);
                for (var count = 0; count < 5; count++) {
                    should.exist(result.lines[count]);
                    result.lines[count].should.have.property('text', 'she sells sea shells down by the seashore');
                }
                done();
            });
        });

        it('should override user supplied options if options are passed in manually.', function (done) {
            shell.execute('echo test -i 5', {}, { message: 'test override', iterations: 10 }, function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(10);
                result.lines[9].should.have.property('text', 'test override');
                done();
            });
        });

        it('should display an error when parameter fails to pass validation.', function (done) {
            shell.execute('echo test -i chicken', function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(1);
                result.lines[0].should.have.property('type', 'error');
                done();
            });
        });

        it('should display an error when a required parameter is not supplied.', function (done) {
            shell.execute('echo', function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(1);
                result.lines[0].should.have.property('type', 'error');
                done();
            });
        });

        it('should have the text printed from the echo command on all five lines.', function (done) {
            shell.execute('echo "node is my fave" -i 5', function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(5);
                for (var count = 0; count < 5; count++) {
                    result.lines[count].should.have.property('text', 'node is my fave');
                }
                done();
            });
        });

    });

    describe('prompt', function () {

        it('should prompt for username and password if not supplied.', function (done) {
            shell.execute('login', function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(1);
                result.lines[0].should.have.property('type', 'log');
                result.lines[0].should.have.property('text', 'Please enter your username.');
                shell.execute('charlie', result.context, function (result) {
                    should.exist(result);
                    result.should.have.property('lines').with.length(1);
                    result.lines[0].should.have.property('type', 'log');
                    result.lines[0].should.have.property('text', 'Please enter your password.');
                    shell.execute('password123', result.context, function (result) {
                        result.should.have.property('lines').with.length(1);
                        result.lines[0].should.have.property('type', 'log');
                        result.lines[0].should.have.property('text', 'Welcome back charlie!');
                        done();
                    });
                });
            });
        });

        it('should not prompt for username or password if supplied.', function (done) {
            shell.execute('login charlie password123', function (result) {
                should.exist(result);
                result.should.have.property('lines').with.length(1);
                result.lines[0].should.have.property('type', 'log');
                result.lines[0].should.have.property('text', 'Welcome back charlie!');
                done();
            });
        });

        it('should set password to true.', function (done) {
            shell.execute('login charlie', function (result) {
                should.exist(result);
                result.should.have.property('password', true);
                done();
            });
        });

    });

    describe('context', function () {

        it('should set a command context.', function (done) {
            shell.execute('topic 123', function (result) {
                should.exist(result);
                result.should.have.property('context').with.property('passive').with.property('cmdStr', 'topic 123');
                done();
            });
        });

        it('should not send values to context command if input matches real command.', function (done) {
            shell.execute('topic 123', function (result) {
                should.exist(result);
                shell.execute('help', result.context, function (result) {
                    should.exist(result);
                    result.should.have.property('lines').with.length(8);
                    done();
                });
            });
        });

        it('should send values to context command if input does not match real command.', function (done) {
            shell.execute('topic 123', function (result) {
                should.exist(result);
                shell.execute('-r "this is my reply"', result.context, function (result) {
                    should.exist(result);
                    result.should.have.property('lines').with.length(1);
                    result.lines[0].should.have.property('type', 'log');
                    result.lines[0].should.have.property('text', 'Your reply was: this is my reply');
                    done();
                });
            });
        });

        it('should prompt user for value if user supplies option with now value.', function (done) {
            shell.execute('topic 123', function (result) {
                should.exist(result);
                shell.execute('-r', result.context, function (result) {
                    should.exist(result);
                    result.should.have.property('lines').with.length(1);
                    result.lines[0].should.have.property('type', 'log');
                    result.lines[0].should.have.property('text', 'Enter your reply.');
                    done();
                });
            });
        });

        it('should clear the context when clear command is issued.', function (done) {
            shell.execute('topic 123', function (result) {
                should.exist(result);
                result.should.have.property('context').with.property('passive').with.property('cmdStr', 'topic 123');
                shell.execute('clear', result.context, function (result) {
                    should.exist(result);
                    result.should.have.property('context').not.with.property('passive');
                    done();
                });
            });
        });

    });

});