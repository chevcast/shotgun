var should = require('chai').should(),
	shotgun = require('../index');

describe('Shotgun Shell', function () {
	var shell = new shotgun.Shell('test/fixtures/cmds');

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
		var result = shell.execute('echo test -i 5', { message: 'test override', iterations: 10 });
		should.exist(result);
		result.should.have.property('lines').with.length(10);
		result.lines[0].should.have.property('text', 'test override');
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
	it('should have the text printed from the echo command on all five lines', function () {
		var result = shell.execute('echo "node is my fave" -i 5');
		should.exist(result);
		for (var count = 0; count < 5; count++) {
			should.exist(result.lines[count]);
			result.lines[count].should.have.property('text', 'node is my fave');
		}
	});
});