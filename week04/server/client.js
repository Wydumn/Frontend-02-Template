const net = require("net")
const { resolve } = require("path")
const { rejects } = require("assert")

class Request {
    constructor(options) {
        this.method = options.method || "GET"
        this.host = options.host
        this.port = options.port || 80
        this.path = options.path || "/"
        this.body = options.body || {}
        this.headers = options.headers || {}
        // 1.1 Content-Type 是必要字段，要有默认值
        if (!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }
        
        // 1.2 不同的Content-Type对应不同的body编码格式
        if (this.headers["Content-Type"] === "appliction/json") {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded") {
            // 1.3 body是 Key - Value 格式
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        }

        this.headers["Content-Length"] = this.bodyText.length
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            // 2.1 建立在TCP连接之上
            if (connection) {
                connection.write(this.toString())
            } else {    // 2.1 没有则根据参数创建对应的TCP连接
                var connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    // console.log(this.toString())
                    connection.write(this.toString())
                })
            }
            connection.on('data', (data) => {
                console.log(data.toString())
                // 2.2 收到的数据传给parser
                parser.receive(data.toString()) 
                // 2.3 根据parser状态resolve Promise
                if (parser.isFinished) {
                    resolve(parser.response)
                    connection.end()    // 关闭TCP连接
                }
            });
            connection.on('error', (err) => {
                reject(err)
                connection.end()
            })
        })
    }

    // 2.2 
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
        ${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\r
        ${this.bodyText}`
    }
}

class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }
    receive(string) {
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }
    receiveChar(char) {
        if(this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
                if (this.headers['Transfer-Encoding'] === 'chunked')
                    this.bodyParser = new TrunkedBodyParser()
            } else {
                this.headerName += char
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue;
                this.headerName = ""
                this.headerValue = ""
            } else {
                this.headerValue += char
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
            this.bodyParser.receiveChar(char)
        }
    }
}

class TrunkedBodyParser {
    constructor() {
        this.WAITING_LENGTH = 0;    
        this.WAITING_LENGTH_LINE_END;  
        this.READING_TRUNK = 2;     
        this.WAITING_NEW_LINE = 3;  
        this.WAITING_NEW_LINE_END = 4; 
        this.length = 0;
        this.content = [];      // 存储chunk-data
        this.isFinished = false;
        this.current = this.WAITING_LENGTH
    }
    receiveChar(char) { // 以 " Hello World\n"为例
        if (this.current === this.WAITING_LENGTH) { 
            if (char === '\r') {    // CR
                if (this.length === 0) {    // 最后一个chunk
                    this.isFinished = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END;
            } else {    // chunk-size
                this.length *= 16;
                this.length += parseInt(char, 16)
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === '\n') {    // LF
                this.current = this.READING_TRUNK;
            }
        } else if (this.current === this.READING_TRUNK) {  // chunk-data
            this.content.push(char)
            this.length --;         // 存一位chunk-data的长度随之减少
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE;  // 下一个chunk
            }
        } else if (this.current === this.WAITING_NEW_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if (this.current === this.WAITING_NEW_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}



void async function() {
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8080",
        path: "/",
        headers: {
            ["X-Foo2"]: "customed"
        },
        body: {
            name: "firm"
        }
    })

    let response = await request.send()

    console.log(response)
}() 