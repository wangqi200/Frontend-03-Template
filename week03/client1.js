// 状态机用函数实现
const net = require('net')
const parser = require('./parser1')

class Request {
  constructor(options) {
    this.method = options.method || 'GET'
    this.host = options.host
    this.port = options.port || 80
    this.path = options.path || '/'
    this.body = options.body || {}
    this.headers = options.headers || {}
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (
      this.headers['Content-Type'] === 'application/x-www-form-urlencoded'
    ) {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join('&')
    }
    this.headers['Content-length'] = this.bodyText.length
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser()
      if (connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString())
          }
        )
      }
      connection.on('data', (data) => {
        // console.log(data.toString())
        parser.receive(data.toString())
        if (parser.isFinished) {
          resolve(parser.response)
          connection.end()
        }
      })
      connection.on('error', (err) => {
        reject(err)
        connection.end()
      })
    })
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers)
      .map((key) => `${key}: ${this.headers[key]}`)
      .join('\r\n')}\r\n\r\n${this.bodyText}`
  }
}

class ResponseParser {
  constructor() {
    this.state = this.waitingStatusLine
    this.statusLine = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    this.bodyParser = null
  }
  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished
  }
  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(''),
    }
  }
  receive(string) {
    for (let char of string) {
      this.state = this.state(char)
    }
  }
  waitingStatusLine(char) {
    if (char === '\r') {
      return this.waitingStatusLineEnd
    }
    this.statusLine += char
    return this.waitingStatusLine
  }
  waitingStatusLineEnd(char) {
    if (char === '\n') {
      return this.waitingHeaderName
    }
    throw new Error('waitingStatusLineEnd error')
  }
  waitingHeaderName(char) {
    if (char === ':') {
      return this.waitingHeaderSpace
    } else if (char === '\r') {
      if (this.headers['Transfer-Encoding'] === 'chunked') {
        this.bodyParser = new ChunkedParser()
      }

      return this.waitingHeaderBlockEnd
    }
    this.headerName += char
    return this.waitingHeaderName
  }
  waitingHeaderSpace(char) {
    if (char === ' ') {
      return this.waitingHeaderValue
    }
    throw new Error('waitingHeaderSpace error')
  }
  waitingHeaderValue(char) {
    if (char === '\r') {
      this.headers[this.headerName] = this.headerValue
      this.headerName = ''
      this.headerValue = ''
      return this.waitingHeaderLineEnd
    }
    this.headerValue += char
    return this.waitingHeaderValue
  }
  waitingHeaderLineEnd(char) {
    if (char === '\n') {
      return this.waitingHeaderName
    }
    throw new Error('waitingHeaderLineEnd error')
  }
  waitingHeaderBlockEnd(char) {
    if (char === '\n') {
      return this.waitingBody
    }
    throw new Error('waitingHeaderBlockEnd error')
  }
  waitingBody(char) {
    this.bodyParser.receiveChar(char)
    return this.waitingBody
  }
}

class ChunkedParser {
  constructor() {
    this.length = 0
    this.content = []
    this.isFinished = false
    this.state = this.waitingLength
  }
  receiveChar(char) {
    this.state = this.state(char)
  }
  waitingLength(char) {
    if (char === '\r') {
      if (this.length === 0) {
        this.isFinished = true
      }
      return this.waitingLengthLineEnd
    }
    this.length *= 16
    this.length += parseInt(char, 16)
    return this.waitingLength
  }
  waitingLengthLineEnd(char) {
    if (char === '\n') {
      return this.readingChunk
    }
    throw new Error('waitingLengthLineEnd error')
  }
  readingChunk(char) {
    this.content.push(char)
    this.length--
    if (this.length === 0) {
      return this.waitingNewLine
    }
    return this.readingChunk
  }
  waitingNewLine(char) {
    if (char === '\r') {
      return this.waitingNewLineEnd
    }
    return this.waitingNewLine
  }
  waitingNewLineEnd(char) {
    if (char === '\n') {
      return this.waitingLength
    }
    return this.waitingNewLineEnd
  }
}

void (async function () {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8088',
    path: '/',
    headers: {
      ['X-Foo2']: 'customed',
    },
    body: {
      name: 'wangqi',
    },
  })

  let response = await request.send()

  let dom = parser.parseHTML(response.body)
  console.log(JSON.stringify(dom, null, "    "));
//   console.log(dom)
})()