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

        it('should emit a clear event when clear command is run. [test 1]', function (done) {
            shell.on('clear', done).execute('clear');
        });

        it('should emit an exit event when exit command is run. [test 2]', function (done) {
            shell.on('exit', done).execute('exit');
        });

        it('should understand command line options passed by the user. [test 3]', function (done) {
            var lineCount = 0;

            shell
                .on('log', function (text, options) {
                    should.exist(text);
                    should.exist(options);
                    options.should.have.property('type', 'log');
                    text.should.equal('she sells sea shells down by the seashore');

                    lineCount++;
                    if (lineCount === 5) done();
                })
                .execute('echo "she sells sea shells down by the seashore" -i 5');
        });

        it('should override user supplied options if options are passed in manually. [test 4]', function (done) {
            var lineCount = 0;

            shell.on('log', function (text, options) {
                should.exist(text);
                should.exist(options);
                options.should.have.property('type', 'log');
                text.should.equal('test override');

                lineCount++;
                if (lineCount === 10) done();
            }).execute('echo test -i 5', null, { message: 'test override', iterations: 10 });
        });

        it('should display an error when parameter fails to pass validation. [test 5]', function (done) {
            shell.on('log', function (text, options) {
                should.exist(text);
                should.exist(options);
                options.should.have.property('type', 'error');
                done();
            }).execute('echo test -i chicken');
        });

        it('should display an error when a required parameter is not supplied. [test 6]', function (done) {
            shell.on('log', function (text, options) {
                should.exist(text);
                should.exist(options);
                options.should.have.property('type', 'error');
                done();
            }).execute('echo');
        });

        it('should ask user for value if the option is required, prompt was set, and user did not supply a value. [test 7]', function (done) {
            var lineCount = 0;
            shell
                .on('log', function (text, options) {
                    should.exist(text);
                    should.exist(options);
                    options.should.have.property('type', 'log');
                    switch (lineCount) {
                        case 0:
                            text.should.equal('Please enter your username.');
                            break;
                        case 1:
                            text.should.equal('Please enter your password.');
                            break;
                        case 2:
                            text.should.equal('Welcome back charlie!');
                            done();
                            break;
                    }
                    lineCount++;
                })
                .execute('login')
                .execute('charlie')
                .execute('password123');
        });

        it('should not prompt user for value if the option is required and prompt was set, but the user already supplied a value for that option. [test 8]', function (done) {
            shell.on('log', function (text, options) {
                should.exist(text);
                should.exist(options);
                text.should.equal('Welcome back charlie!')
                options.should.have.property('type', 'log');
                done();
            }).execute('login charlie password123');
        });

        it('should emit a password event when an option specifies it is a password value and prompt is set. [test 9]', function (done) {
            shell.on('password', done).execute('login charlie');
        });

        describe('context', function () {

            it('should contain a custom context variable when the command module calls the shell.context.setVar helper method. [test 10]', function (done) {
                shell.on('done', function () {
                    var recentTopic = shell.context.getVar('recentTopic');
                    should.exist(recentTopic);
                    recentTopic.should.equal(123);
                    done();
                }).execute('topic 123');
            });

        });

    });

});
