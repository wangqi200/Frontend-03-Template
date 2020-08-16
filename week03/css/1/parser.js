const css = require('css');
const EOF = Symbol("EOF");//利用symbol的唯一性做了一个终止符

let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;
let stack = [{type:"document", children:[]}];
// 加入一个新的函数，addCSSRules，这里我们把CSS规则暂存到一个数组里
let rules = [];
function addCSSRules(text){
    var ast = css.parse(text);
    console.log(JSON.stringify(ast, null, "    "));
    rules.push(...ast.stylesheet.rules);
}
function emit(token){
    // console.log('token',token);
    let top = stack[stack.length -1];
    

    if(token.type == "startTag"){
        let element = {
            type:"element",
            children:[],
            attributes:[]
        };
        element.tagName = token.tagName;
        for(let p in token){
            if(p != "type" && p != "tagName"){
                element.attributes.push({
                    name:p,
                    value:token[p]
                });
            }
        }
        top.children.push(element);
        element.parent = top;
        if(!token.isSelfClosing){
            stack.push(element);
        }
        currentTextNode = null;
    }else if(token.type == "endTag"){
        if(top.tagName != token.tagName){
            throw new Error("Tag start end doesn't match!");
        }else{
            // +++++++++++遇到style标签时，执行添加css规则的操作+++++++++//
            if(top.tagName === "style"){
                addCSSRules(top.children[0].content);
            }
            stack.pop();
        }
        currentTextNode = null;
    }else if(token.type === 'text'){
        if(currentTextNode == null){
            currentTextNode = {
                type:"text",
                content:""
            }
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}


function data(c){
    // HTML标签以<开始
    if(c == '<'){
        return tagOpen;
    }else if( c == EOF){
        emit({
            type:'EOF'
        })
        return ;
    }else{
        // 文本节点
        emit({
            type:'text',
            content:c
        })
        return data;
    }

}
function tagOpen(c){
    // 是不是结束标签
    if(c == '/'){
        // 结束标签的开头
        return endTagOpen;
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type:'startTag',
            tagName:''
        }
        return tagName(c);
    }else{
        return ;
    }
}
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: 'endTag',
            tagName:''
        }
        return tagName(c);
    }else if(c == '>'){
        // return tagName(c);
    }else if(c == EOF){
        
    }else{

    }
}
function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c == '/'){
        // 此时说明是一个自封闭标签
        return selfClosingStartTag;
    }else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName += c //.toLowerCase();
        return tagName;
    }else if( c == '>'){
        // 普通的开始标签
        emit(currentToken);
        return data;
    }else{
        return tagName;
    }
}
function beforeAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c == '/' || c == '>' || c == EOF){
        return afterAttributeName(c);
    }else if(c == '='){
        // return beforeAttributeName;
    }else{
        currentAttribute = {
            name:'',
            value:''
        }
        // console.log("currentAttribute",currentAttribute)
        return attributeName(c);
    }
}
function attributeName(c){
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF){
        return afterAttributeName(c);
    }else if(c == '='){
        return beforeAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == "\"" || c== "" || c == "<"){

    }else{
        currentAttribute.name += c;
        return attributeName;
    }
}
function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF){
        return beforeAttributeValue;
    }else if(c == "\""){
        return doubleQuotedAttributeValue;;
    }else if(c == "\'"){
        return singleQuotedAttributeValue;
    }else if(c == ">"){

    }else{
        return UnquotedAttributeValue(c);
    }
}
function doubleQuotedAttributeValue(c){
    if(c == "\""){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function singleQuotedAttributeValue(c){
    if(c == "\'"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    }else if(c == "\u0000"){

    }else if(c == EOF){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        return beforeAttributeName;
    }else if(c == "/"){
        return selfClosingStartTag;
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if( c== EOF){

    }else{
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}
function UnquotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    }else if(c == "/"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if(c == "\u0000"){

    }else if(c == "\"" || c == "'" || c == "<" || c== "=" || c =="`"){

    }else if( c== EOF){

    }else{
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}
function afterAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return afterAttributeName;
    }else if(c == "/"){
        return selfClosingStartTag;
    }else if(c == "="){
        return beforeAttributeName;
    }else if(c == ">"){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    }else if( c== EOF){

    }else{
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name:"",
            value:""
        }
        return attributeName(c);
    }
}
function selfClosingStartTag(c){
    if( c == '>'){
        currentToken.isSelfClosing = true;
        return data;
    }else if(c == 'EOF'){ 

    }else{
        
    }
}
module.exports.parseHTML = function parseHTML(html){
    // console.log('html',html);
    let state = data;
    for(let c of html){
        state = state(c);
    }
    state = state(EOF);
    // console.log(stack[0])
    return stack[0]
}