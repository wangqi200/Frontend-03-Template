/*
 * @Author: your name
 * @Date: 2020-12-06 21:49:00
 * @LastEditTime: 2020-12-06 21:53:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /Frontend-03-Template/week18/test-demo/test/test.js
 */
var assert = require('assert');
var add = require('../add.js') 

// describe('Array', function() {
//   describe('#indexOf()', function() {
    it('1 + 2 should be 3', function() {
      assert.equal(add(1, 2), 3);
    });
//   });
// });