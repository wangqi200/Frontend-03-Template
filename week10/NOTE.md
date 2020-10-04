学习笔记
### LST 抽象语法树
分词 - 构造树
扫描  规约
LL  CR

#### 四则运算
TokenNumber：1、2、3、4、5、6、7、8、9、0的组合
Operate：+、-、*、/之一
Whitespace：<SP>
LineTerminator:<LF><CR>

```
//TERMINAL SYMBOL : <EOF>
<Expression>::= <AdditiveExpression><EOF>
  //TERMINAL SYMBOL : <+> <->
  <AdditiveExpression>::= <MultiplicativeExpression> | <AdditiveExpression> <+> <MultiplicativeExpression> | <AdditiveExpression> <-> <MultiplicativeExpression>
  //TERMINAL SYMBOL : <NUMBER> <*> </>
  <MultiplicativeExpression> ::= <Number> | <MultiplicativeExpression> <*> <Number>| <MultiplicativeExpression> </> <Number>
```



#### 词法分析正则
``` 
var regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g

    var dictionary = ["Number", "Whitespace", "LineTerminator", "*", "/", "+", "-"];

    function tokenize(source){
        var result = null;
        while(true){
            
            result = regexp.exec(source);

            if(!result) break;

            for(var i = 1; i <= dictionary.length; i++){
                if(result[i])
                    console.log(dictionary[i - 1]);
            }
            console.log(result);
        }
    }

```

#### MultiplicativeExpression
```
 function MultiplicativeExpression(source){
        if(source[0].type === "Number"){
            let node = {
                type:"MultiplicativeExpression",
                children:[source[0]],
            }
            source[0] = node;
            return MultiplicativeExpression(source);
        }
        if(source[0].type == "MultiplicativeExpression" && source[1] && source[1].type === "*"){
            let node = {
                type:"MultiplicativeExpression",
                operator:"*",
                children:[],
            }
            node.children.push(source.shift());
            node.children.push(source.shift());
            node.children.push(source.shift());
            source.unshift(node);
            return MultiplicativeExpression(source);
        }
        if(source[0].type === "MultiplicativeExpression" && source[1] && source[1].type === "/"){
            let node = {
                type:"MultiplicativeExpression",
                operator:"/",
                children:[],
            }
            node.children.push(source.shift());
            node.children.push(source.shift());
            node.children.push(source.shift());
            source.unshift(node);
            return MultiplicativeExpression(source);
        }
        if(source[0].type === "MultiplicativeExpression")
            return source[0];
        return  MultiplicativeExpression(source)


        // console.log(source);
    }
```

#### AdditiveExpression
```
function AdditiveExpression(source){
        if(source[0].type === "MultiplicativeExpression"){
            let node = {
                type:"AdditiveExpression",
                children:[source[0]],
            }
            source[0] = node;
            return AdditiveExpression(source);
        }
        if(source[0].type == "AdditiveExpression" && source[1] && source[1].type === "+"){
            let node = {
                type:"AdditiveExpression",
                operator:"+",
                children:[],
            }
            node.children.push(source.shift());
            node.children.push(source.shift());
            MultiplicativeExpression(source);
            node.children.push(source.shift());
            source.unshift(node);
            return MultiplicativeExpression(source);
        }
        if(source[0].type === "AdditiveExpression" && source[1] && source[1].type === "-"){
            let node = {
                type:"AdditiveExpression",
                operator:"-",
                children:[],
            }
            node.children.push(source.shift());
            node.children.push(source.shift());
            MultiplicativeExpression(source);
            node.children.push(source.shift());
            source.unshift(node);
            return MultiplicativeExpression(source);
        }
        if(source[0].type === "AdditiveExpression")
            return source[0];
        MultiplicativeExpression(source);
        return  AdditiveExpression(source)
    }
```

#### Expression

```
function Expression(tokens){
        if(source[0].type === "AdditiveExpression" && source[1] && source[1].type === "EOF"){
            let node = {
                type:"Expression",
                children:[source.shift(), source.shift()],
            }
            source.unshift(node);
            return node;
        }
        AdditiveExpression(source);
        returnExpression(source);
    }
```