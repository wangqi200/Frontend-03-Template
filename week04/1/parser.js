const css = require('css');
const EOF = Symbol("EOF"); //利用symbol的唯一性做了一个终止符
const layout = require('./layout.js')
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let stack = [{
    type: "document",
    children: []
}];
// 加入一个新的函数，addCSSRules，这里我们把CSS规则暂存到一个数组里
let rules = [];

function addCSSRules(text) {
    var ast = css.parse(text);
    // console.log(JSON.stringify(ast, null, "    "));
    rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
    // console.log(element, selector)
    if (!selector || !element.attributes) {
        return false;
    }
    if (selector.charAt(0) == "#") {
        var attr = element.attributes.filter(attr => attr.name === "id")[0]
        if (attr && attr.value === selector.replace("#", "")) {
            return true;
        }
    } else if (selector.charAt(0) == ".") {
        var attr = element.attributes.filter(attr => attr.name === "class")[0]
        if (attr && attr.value === selector.replace(".", "")) {
            return true;
        }
    } else {
        if (element.tagName === selector) {
            return true;
        }
    }
    return false;

}

function specificity(selector) {
    var p = [0, 0, 0, 0];
    var selectorParts = selector.split(" ");
    for (var part of selectorParts) {
        if (part.charAt(0) == "#") {
            p[1] += 1;
        } else if (part.charAt(0) == ".") {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0];
    }
    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    }
    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    }
    return sp1[3] - sp2[3];
}

function computeCSS(element) {
    // rules 后面有2条内容，但是element attributes有内容
    // console.log('rules',rules);
    // console.log("compute CSS fro Element", element);
    var elements = stack.slice().reverse();
    if (!element.computedStyle) {
        element.computedStyle = {};
    }
    for (let rule of rules) {
        var selectorParts = rule.selectors[0].split(" ").reverse();

        if (!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        var j = 1;
        for (var i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        if (j >= selectorParts.length) {
            matched = true;
        }
        if (matched) {
            // 如果匹配到，我们要加入
            // console.log("Element", element, "matched rule", rule);
            var sp = specificity(rule.selectors[0]);
            var computedStyle = element.computedStyle;
            // for (var declaration of rule.declarations) {
                // 不知道是不是手误 多敲了一个S
            for (var declaration of rule.declaration) {

                if (!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }
                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp
                } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp
                }
                // computedStyle[declaration.property].value = declaration.value
            }
            // console.log(element.computedStyle)
        }
    }
}
// let inlineStyle = element.attributes.filter(p=>p.name == "style");
// css.parse("*{"+inlineStyle+"}")
// sp = [1,0,0,0]
// for(...){...}

function emit(token) {
    // console.log('token',token);
    let top = stack[stack.length - 1];


    if (token.type == "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };
        element.tagName = token.tagName;
        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            }
        }

        computeCSS(element);

        top.children.push(element);
        // 有差别，为什么没有这句了，为什么不挂在过去了
        // element.parent = top;
        if (!token.isSelfClosing) {
            stack.push(element);
        }
        currentTextNode = null;
    } else if (token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {
            // +++++++++++遇到style标签时，执行添加css规则的操作+++++++++//
            if (top.tagName === "style") {
                addCSSRules(top.children[0].content);
            }
            // flex布局是一定要知道子元素的，所以是发生在结束标签之前
            layout(top);
            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type === 'text') {
        if (currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}


function data(c) {
    // HTML标签以<开始
    if (c == '<') {
        return tagOpen;
    } else if (c == EOF) {
        emit({
            type: 'EOF'
        })
        return;
    } else {
        // 文本节点
        emit({
            type: 'text',
            content: c
        })
        return data;
    }

}

function tagOpen(c) {
    // 是不是结束标签
    if (c == '/') {
        // 结束标签的开头
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c);
    } else {
        return;
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c);
    } else if (c == '>') {
        // return tagName(c);
    } else if (c == EOF) {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == '/') {
        // 此时说明是一个自封闭标签
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c //.toLowerCase();
        return tagName;
    } else if (c == '>') {
        // 普通的开始标签
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c);
    } else if (c == '=') {
        // return beforeAttributeName;
    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        // console.log("currentAttribute",currentAttribute)
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c);
    } else if (c == '=') {
        return beforeAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<") {
        // 这一条判断条件少了 单引号的判断  ’
    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
        return beforeAttributeValue;
    } else if (c == "\"") {
        return doubleQuotedAttributeValue;;
    } else if (c == "'") {
        return singleQuotedAttributeValue;
    } else if (c == ">") {

    } else {
        return UnquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c == "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<" || c == "=" || c == "`") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}
function selfClosingStartTag(c) {
    if (c == '>') {
        currentToken.isSelfClosing = true;
        return data;
    } else if (c == 'EOF') {

    } else {

    }
}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == "=") {
        // 有差别  两种方式应该是不同的  不一定是谁写错了
        // return beforeAttributeName;
        return beforeAttributeValue
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}



module.exports.parseHTML = function parseHTML(html) { 
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF)
    return stack[0];
}

// 备注：
// 1、element.parent = top;  这句是起什么作用来着
// 2、function afterAttributeName（）中
// if (c == "=") {
//   //   两种方式应该是不同的  不一定是谁写错了
//     // return beforeAttributeName;
//     return beforeAttributeValue
// }
// 每个函数是做什么的要补充注释进去