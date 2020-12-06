<!--
 * @Author: your name
 * @Date: 2020-11-09 23:09:29
 * @LastEditTime: 2020-12-06 22:00:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings 
 * @FilePath: /Frontend-03-Template/week18/NOTE.md
-->
学习笔记、
单元测试工具-mocha
使用npm 全局安装
```
npm install --global mocha
```
然后加入项目依赖项
```
 npm install --save-dev mocha
```
编写test文件
```
var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});
```

如何解决import问题 -> 利用babel register
```
mocha --require @bebel/register
```
「MODULE_NOT_FOUND」错误：
调用local的mocha即可解决


