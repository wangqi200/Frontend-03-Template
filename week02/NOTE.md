第二周学习笔记
#### 主要内容是关于浏览器工作原理：
1、url  -> http
Html -> parse
Dom -> css computing
Dom with css -> layout
Dam with position -> render
->Bitmap
2、什么是有限状态机：每一个状态都是一个机器，每一个机器知道下一个状态，状态机是纯函数（无副作用）
3、HTTP请求
第一步 Request函数
七层网络模型：应用层、表示层、会话层、传输层、网络层、数据链路层、物理层

第二步 send函数
  在Request的构造器中手机必要的信息
  用send函数，把请求真实发送到服务器
  send函数是异步的，所以返回promise

第三步发送请求
    设计支持已有的connection或者自己新建connection
    收到数据传给parser
    根据parser的状态resolve Promise

第四步 ResponseParser
    Response必须分段构造，所以我们要用一个ResponseParser来“装配”
    ResponseParser分段处理ResponseText，我们用状态机来分析文本结构

第五步 BodyParser
    Response的body可能根据Content-Type有不同的结构，因此采用子Parser的结构来解决问题
    以TrunkedBodyParser为例，我们同样用状态机来处理body的格式