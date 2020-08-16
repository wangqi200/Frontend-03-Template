let currentToken = null;
function emit(token){
    // if(token.type!='text)
    console.log('token',token);
}

const EOF = Symbol("EOF");//利用symbol的唯一性做了一个终止符
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
    }else if(c == '>'){
        return data;
    }else if(c == '='){
        return beforeAttributeName;
    }else{
        return beforeAttributeName;
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
    console.log('html',html);
    let state = data;
    for(let c of html){
        state = state(c);
    }
    state = state(EOF);
}