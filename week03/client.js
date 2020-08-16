const net = require("net"); // a TCP lib
const parser = require("./parser.js");

class Request {
    constructor(options){
        this.method = options.method || "GET"; // why ||? ensure the Null is replaced by a default value.
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.body = options.body || {};
        this.headers = options.headers || {};
        if(!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded"; // essential field in a HTTP message 
        }
        
        if(this.headers["Content-Type"] === "application/json"){
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded"){
            this.bodyText = Object.keys(this.body)
                            .map( (key) => {
                                    return `${key}=${encodeURIComponent(this.body[key])}`
                                })
                            .join("&");
        }
        this.headers["Content-Length"] = this.bodyText.length;
    }

    send(connection){ // The parameter connection is a constructed TCP connection.
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            if(connection){
                connection.write(this.toString());
            } else {
                connection = net.createConnection({host: this.host, port: this.port}, 
                    () => { connection.write(this.toString());} // A callback function when the connection is created successfully
                    );
            }
            connection.on('data', (data) => { // listen to the connection's data field
                parser.receive(data.toString());
                if(parser.isFinished){
                    resolve(parser.response); // resolve also means return?
                    connection.end();
                }
            });
            connection.on('error', (err) => {
                reject(err);
                connection.end();
            });
        });
    }

    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`;
    }
}

class ResponseParser{
    constructor(){
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;                  // The text format of BODY is flexible

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }

    get isFinished(){ // the keyword get?
        return this.bodyParser && this.bodyParser.isFinished;
    }

    get response(){
        this.statusLine.match(/HTTP\/1.1 (\d+) (\S+)/);
        return {
            statusCode: RegExp.$1, //RegExp?
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string){
        for(let i = 0; i<string.length; i++){
            this.receiveChar(string.charAt(i));
        }
    }

    receiveChar(char){
        if(this.current === this.WAITING_STATUS_LINE){
            if(char === '\r'){
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if(this.current === this.WAITING_STATUS_LINE_END){
            if(char === '\n'){
                this.current = this.WAITING_HEADER_NAME; 
            } else {
                // no else for a correct response
            } 
        } else if(this.current === this.WAITING_HEADER_NAME){
            if(char === ':'){
                this.current = this.WAITING_HEADER_SPACE;
            } else if(char === '\r'){
                this.current = this.WAITING_HEADER_BLOCK_END;
                if(this.headers['Transfer-Encoding'] === 'chunked'){
                    this.bodyParser = new ChunkedBodyParser();
                }
            } else {
                this.headerName += char;
            }
        } else if(this.current === this.WAITING_HEADER_SPACE){
            if(char === ' '){
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if(this.current === this.WAITING_HEADER_VALUE){
            if(char === '\r'){
                this.headers[this.headerName] = this.headerValue;
                this.headerName = "";
                this.headerValue = "";
                this.current = this.WAITING_HEADER_LINE_END;
            } else {
                this.headerValue += char;
            }
        } else if(this.current === this.WAITING_HEADER_LINE_END){
            if(char === '\n'){
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if(this.current === this.WAITING_HEADER_BLOCK_END){
            if(char === '\n'){
                this.current = this.WAITING_BODY;
            }
        } else if(this.current === this.WAITING_BODY){
            this.bodyParser.receiveChar(char);
        }
    }
}

class ChunkedBodyParser{
    constructor(){
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

    receiveChar(char){
        if(this.current === this.WAITING_LENGTH){
            if(char === '\r'){
                this.current = this.WAITING_LENGTH_LINE_END;
                if(this.length === 0){
                    this.isFinished = true;
                }
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16); // base 16
            }
        } else if(this.current === this.WAITING_LENGTH_LINE_END){
            if(char === '\n'){
                this.current = this.READING_CHUNK;
            }
        } else if(this.current === this.READING_CHUNK){
            if(this.length!==0){ // make sure it's volid to push a new char to the content
                this.content.push(char);
            }
            if(this.content.length === this.length){
                this.current = this.WAITING_NEW_LINE;
                this.length = 0; //RESET for a chunk
            }
        } else if(this.current === this.WAITING_NEW_LINE){
            if(char === '\r'){
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if(this.current === this.WAITING_NEW_LINE_END){
            if(char === '\n'){
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}

void async function(){ // async? void?
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        path: "/",
        headers: {
            ["X-Foo2"]: "customed" // array can be a key?
        }, 
        body: {
            name: "wangqi"
        }
    });

    let response = await request.send(); // await? 
    console.log(response);
    let dom = parser.parseHTML(response.body);
    console.log(JSON.stringify(dom, null, "    "));
    console.log("");
}();