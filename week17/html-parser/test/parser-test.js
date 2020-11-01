var assert = require('assert');

import { parseHTML } from '../src/parser.js'

describe("parse html", function () {
    it('<a></a>', function() {
        let tree = parseHTML('<a></a>');
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
    });

    it('<a>test</a>', function() {
        let tree = parseHTML('<a>test</a>');        
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 1);
    });

    it('<a href="www.baidu.com">test</a>', function() {
        let tree = parseHTML('<a href="www.baidu.com">test</a>');
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 1);
    });

    it('<a id=\'asd\' />', function() {
        let tree = parseHTML('<a id=\'asd\' />');
        console.log(tree);
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
    });

    it('<a/>', function() {
        let tree = parseHTML('<a/>');
        console.log(tree);
        assert.equal(tree.children[0].tagName, "a");
        assert.equal(tree.children[0].children.length, 0);
    });
})