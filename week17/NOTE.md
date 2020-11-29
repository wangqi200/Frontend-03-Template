
### 工具链
generator
YEOMAN（脚手架生成器）https://yeoman.io/

index.js 中是通过继承 Generator 来声明类，与其它代码不一样的是，Generator 的代码是一行一行往下执行的。

Yeoman 具备的能力
1、用户交互能力
2、文件系统能力
3、依赖系统

build工具-webpack
build 是同时为开发和发布服务的。
核心思路：打包出一个js文件，用html手动去引用js文件
多文件合并，通过loader，plugin控制合并的规则和对文本进行一些转换
webpack-cli 提供了webpack命令
loader的使用把一个source变成目标代码，纯粹的文本的转换，会把根据所转出来的import语句或者reqiure函数所对应的文件加载进来。
通过test规则，决定什么样的后缀名的文件，使用什么样的loader，也可以使用多个loader处理同一个文件
plugin更像是一种独立的机制，插件可以实现Loaders无法实现的功能，像HtmlWebpackPlugin 
Mode 指定模式，开发或者是生产。指定生产后，webpack会自动执行一些优化命令。像压缩代码
Browser Compatibility，webpack 5 新增属性，由于webpack需要import、Promise而的ES5-compliant只支持IE8及以上的浏览器，因此IE8以下的环境可以需要使用polyfill。
Environment，webpack 5 新增属性，webpack 需要运行在 8.x 及以上的 Node.js 环境中。


babel：
把新版本的js编译成老版本的js
