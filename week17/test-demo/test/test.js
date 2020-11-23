var assert = require('assert');

import { add, mul } from '../add'

describe("add function test", function () {
    it('1+2 should be equal to 3', function() {
        assert.equal(add(1, 2), 3);
    });
    
    it('-5+2 should be equal to -3', function() {
        assert.equal(add(-5, 2), -3);
    });

    it('-5*2 should be equal to -10', function() {
        assert.equal(mul(-5, 2), -10);
    });

    it('-3*3 should be equal to -9', function() {
        assert.equal(mul(-3, 3), -9);
    });
})