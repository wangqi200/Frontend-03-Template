let net = require('net');
const parser = require('./parser');
const images = require('images');
const render = require('./render');
class Request {
    constructor(options = {}) {
        this.method = options.method || 'GET';
        this.port = options.port || 80;
        this.host = options.host;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            // console.log(this.body)
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    send(connection) {
        // console.log(this.host,this.port,this.toString());
        debugger;
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            //  有差别，两种写法应该是没差别的
            // const parser = new ResponseParser()
            if (connection) {
                connection.write(this.toString());
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString());
                })
            }

            connection.on('data', (data) => {
                // console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            });

            connection.on('error', (err) => {
                reject(err);
                connection.end();
            });
        })
    }
// 有差别 这个位置的写法各有不同，但都是正确的，下面的代码没有更改
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n` +
            `${Object.keys(this.headers).map(key=>`${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n` +
            `${this.bodyText}\r\n`
    }
}

class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0; // /r
        this.WAITING_STATUS_LINE_END = 1; // /n
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
        this.bodyParser = null;
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }
    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i));
        }
    }
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                // 有差别，状态机写错了
                // this.current = this.WAITING_HEADER_LINE_END;
                this.current = this.WAITING_STATUS_LINE_END
            } else {
                this.statusLine += char;
            }
        // } else if (this.current === this.WAITING_HEADER_LINE_END) {
        } else if (this.current === this.WAITING_STATUS_LINE_END) {

            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser();
                }
            } else {
                this.headerName += char;
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this.current = this.WAITING_BODY;
            }
        } else if (this.current === this.WAITING_BODY) {
            // console.log(char)
            this.bodyParser.receiveChar(char);
        }
    }
}
class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_CHUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;

        this.length = 0;
        this.content = [];
        this.isFinished = false;
        this.current = this.WAITING_LENGTH;
    }

    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === '\r') {
                if (this.length === 0) {
                    this.isFinished = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {
                this.current = this.READING_CHUNK;
            }
        } else if (this.current === this.READING_CHUNK) {
            // if(this.length!==0){ // make sure it's volid to push a new char to the content
            //     this.content.push(char);
            // }
            // if(this.content.length === this.length){
            //     this.current = this.WAITING_NEW_LINE;
            //     this.length = 0; //RESET for a chunk
            // }
            // 有差别，更正后的，上面的代码不知道是怎么加的 23333  但应该和下面的是相同含义
            this.content.push(char);
            this.length--;
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE;
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if (this.current = this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ['x-Foo2']: 'customed'
        },
        body: {
            name: 'wangqi'
        }
    });

    // try {
        let response = await request.send();

        let dom = parser.parseHTML(response.body)

        let viewport = images(800, 600);
        // 第二个参数没有找到，看来是前面创建的dom有问题
        // 获取 dom.children[0].children[3].children[1] 元素的attributes里面没有内容
        render(viewport, dom);
        viewport.save("viewport.jpg");
        // console.log(JSON.stringify(dom, null, '     '))
        // console.log('')
    // } catch (err) {
    //     console.log('error: ', err.message)
    // }

}();

// 备注：主要bug 是状态机的执行顺序写错了，以及状态机的赋值用了 === 