var should = require('chai').should(),
	Shell = require('../index');

describe('Shell', function() {
	var shell = new Shell('fixtures');

	describe('Result Object', function() {
		it('should return the options object passed into execute.', function() {
			var options = { something: true };
			var result = shell.execute('test', options);
			result.should.equal(options);
			result.should.have.property('something', true);
		});
	});
});