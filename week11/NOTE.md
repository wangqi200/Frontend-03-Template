学习笔记
### 字符串分析算法

#### 字典树
* 大量高重复字符串的存储于分析 （精确，完全匹配，搜索关键词）
#### KMP
* 在长字符串里找模式 （部分匹配）
#### Wildcard
* 带通配符的字符串模式 （文件查找）
#### 正则
* 字符串通用模式匹配
#### 状态机
* 通用的字符串分析
#### LL LR
* 字符串多层级结构分析  （多层级结构）


#### 字典树   Trie

```
let $ = Symbol("$");
    class Trie {
        constructor(){
            this.root = Object.create(null);
        }
        // 插进字典树
        insert(word){
            let node = this.root;
            for(let c of word){
                if(!node[c])
                    node[c] = Object.create(null); //子树不存在就先创建
                node = node[c];
            }
            // $作为截止符
            if(!($ in node))
                node[$] = 0;
            node[$] ++
        }
        // 出现次数最多的
        most(){
            let max = 0;
            let maxWord = null;
            let visit = (node, word) => {
                if(node[$] && node[$] > max){
                    max = node[$];
                    maxWord = word;
                }
                for(let p in node){
                    visit(node[p], word + p);
                }
            }
            visit(this.root, "");
            console.log(maxWord, max);
        }
    }
    function randomWord(length){
        var s = "";
        for(let i = 0; i < length; i++){
            s += String.fromCharCode(Math.random() * 26 + "a".charCodeAt(0));
        }
        return s;
    }
    let trie = new Trie();
    for(let i = 0; i < 100000; i++){
        trie.insert(randomWord(4));
    }

```

#### KMP  模式匹配
字符串的自重复行为
```
function kmp(source, pattern){
    //计算table
    let table = new Array(pattern.length).fill(0);
    {
        // abcdabce
        //i 自重复的位置
        let i = 1, j = 0;
        while(i < pattern.length){
            if(pattern[i] === pattern[j]){
                ++j, ++i;
                table[i] = j;
            } else {
                if(j > 0)
                    j = table[j];
                else 
                    ++i;
                    
            }
        }
        // console.log(table);
    }
    {
        let i = 0, j = 0;
        while(i < source.length){
           
            if(pattern[j] === source[i]){
                ++i, ++j;
            }else{
                if(j > 0) 
                    j = table[j];
                else 
                    ++i;
            }
            if( j === pattern.length){
                return true;
            }
        }
        return false;
    }
    //匹配
}
 kmp("hello", "ll")

```

#### wildcard 
wildcard: ab*c?d*abc*a?d
只有*：ab*cd*abc*a?d      最后一个*要尽可能多的匹配  前面的是尽可能少的匹配
只有?：c?d, a?d