学习笔记
### 重学CSS
1、CSS总体结构
2、CSS规则研究
3、CSS规则
    选择器
    声明
4、css收集标准
`` 
Array.prototype.slice.call(document.querySelector("#container").children).filter(e=>e.getAttribute("data-tag").match(/css/)).map(e=>({name:e.children[1].innerText, url:e.children[1].children[0].href}))
``
5、CSS选择器语法
    * 简单选择器：* div svg|a .cls #id [attr=value] :hover ::before
    * 复合选择器：
        * <简单选择器><简单选择器><简单选择器>
        * *或者div必须写在最前面
    * 复杂选择器：
        * <复合选择器><sp><复合选择器>
        * <复合选择器>">"<复合选择器>
        * <复合选择器>"~"<复合选择器>
        * <复合选择器>"+"<复合选择器>
        * <复合选择器>"||"<复合选择器>

6、伪类
* 链接/行为
    * :any-link     
    * :link :visited      安全性
    * :hover
    * :active
    * focus
    * :target
* 树结构
    * ：empty
    * :nth-child()  父元素的第几个child  奇偶问题
    * :nth-last-child()   从后往前数
    * :first-child :last-child :only-child
* 逻辑性
    * :not伪类 
    * :where :has
不要再代码中出现过于多的复杂选择器，过多的复杂选择器，另一个角度也说明了html结构划分的不合理

7、伪元素
* ::before    可以写content属性 
* ::after
* ::first-line    原本存在content属性  无中生有
* ::first-letter   把特定元素括起来
可用属性
first-line:
* font系列
* color
* background
* word-spacing
* letter-spacing
* text-decoration
* text-transform
* line-height


fist-letter:
* font系列
* color
* background
* word-spacing
* letter-spacing
* text-decoration
* text-transform
* line-height
* float
* vertical-align
* 盒模型系列：margin padding border

