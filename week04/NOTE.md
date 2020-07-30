### 有限状态机器

处理字符串

不用状态机找到字符串"abcdef"

```js
function match(str) {
    let foundA = false,
        foundB = false,
        foundC = false,
        foundD = false,
        foundE = false,
        foundF = false;
    
    for (const s of str) {
        if (s === "a") {
            foundA = true;
        } else if (foundA && s === "b") {
            foundB = true
        } else if (foundB && s === "c") {
            foundC = true
        } else if (foundC && s === "d") {
            foundD = true
        } else if (foundD && s === "e") {
            foundE = true
        } else if (foundE && s === "f"){
            foundF = true
        }
    }
    
    return foundF
}
```



### 1. 实现一个HTTP请求

```js
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
        // 1. Content-Type 是必要字段，要有默认值
        if (!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }
        
        // 2. 不同的Content-Type对应不同的body编码格式
        if (this.headers["Content-Type"] === "appliction/json")
            this.bodyText = JSON.stringify(this.body)
        else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded")
            // 3. body是 Key - Value 格式
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');

        this.headers["Content-Length"] = this.bodyText.length
    }

    send() {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            resolve("")
        })
    }
}
```



### 2. send函数的编写

1. 在`Request`的构造器中收集必要信息
2. 设计`send`函数，把请求发送到服务器
3. `send`函数应该是异步的，所以返回`Promise`
   1. 设计支持已有的connection或者自己创建connection
   2. 收到数据传给parser
   3. 根据parser的状态resolve Promise

response的格式

```abnf

```



逐步的收到response，response构造完成后，resolve

```js
class Request {
    constructor(options) {
		// ...
    }

    send() {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            // 2.1 建立在TCP连接之上
            if (connection) {
                connection.write(this.toString())
            } else {    // 2.1 没有则根据参数创建对应的TCP连接
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
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
```



### 3. response解析

1. `Response`必须分段构造，用一个`ResponseParser`来“装配”
2. `ResponseParser`分段处理`ResponseText`，用**状态机**来分析文本的结构

```bnf
Response	= Status-Line
			  *(( general-header
               | response-header
               | entity-header ) CRLF)
              CRLF
              [ message-body ]
              
Status-Line = HTTP-Version SP Status-Code SP Reason-Phrase CRLF

response-header = Accept-Ranges           
                  | Age                   
                  | ETag                    
                  | Location                
                  | Proxy-Authenticate      
                  | Retry-After             
                  | Server                  
                  | Vary                    
                  | WWW-Authenticate
```

23

```js
class ResponseParser {
    constructor() {
        // status-line 
        // Status-Line = HTTP-Version SP Status-Code SP Reason-Phrase CRLF
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1;
        // header
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        // message-body
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;	// 当前状态
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
                // 如果有\n就是CRLF，所以置为WAITING_STATUS_LINE_END状态
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                // 有\n，status-line就结束了
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === '\r') {
                this.current = this.WAITING_HEADER_BLOCK_END;
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
            console.log(char)
        }
    }
}
```



### 4. response body解析

1. `Response`的body可能根据`Content-Type`由不同的结构，因此采用子Parser的结构来解决问题
2. 以`TrunkedBodyParser`为例，用状态机来处理body的格式

> If the body is being sent using a "chunked" encoding ([Section 3.6](https://www.w3.org/Protocols/HTTP/1.1/rfc2616bis/draft-lafon-rfc2616bis-latest.html#transfer.codings)), a zero length chunk and empty trailer *may* be used to prematurely mark the end of the message. If the body was preceded by a Content-Length header, the client *must* close the connection. 

Truncked协议

![1595949323067](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1595949323067.png)

 chunk主要包含大小和数据，大小表示这个这个trunck包的大小，使用16进制标示。其中trunk之间的分隔符为CRLF 

```abnf
Chunked-Body = *chunk
			   last-chunk
			   trailer-part
			   CRLF
			   
chunk		 	= chunk-size [ chunk-extension ] CRLF
chunk-size	 	= 1*HEX
last-chunk	 	= 1*("0") [ chunk-extension ] CRLF
chunk-extension = *( ";" chunk-ext-name [ "=" chunk-ext-val ] )
chunk-ext-name  = token 
chunk-ext-val	= token | quoted-string
chunk-data		= 1*OCTET ; a sequence of chunk-size octets

trailer-part	= *(entity-header CRLF)

大小（chunk-data）和数据（chunk-data）
last-chunk的chunk-size为0来标识chunk发送完成
```



```js
解码chunked的伪代码
length := 0
read chunk-size, chunk-extension (if any) and CRLF
while (chunk-size > 0) {
    read chunk-data and CRLF
    append chunk-data to entity-body
    length := length + chunk-size
    read chunk-size and CRLF
}
read entity-header
while (entity-header not empty) {
    append entity-header to existing header fields
    read entity-header
}
Content-Length := length
Remove "chunked" from Transfer-Encoding
```







### Augmented BNF

扩展BNF语法，可以用来描述协议的规则

```abnf
空白字符：用来分隔定义中的各个元素
	- method SP request-target SP HTTP-version CRLF
	
选择/：表示多个规则都是可供选择的规则
	- start-line = request-line / status-line
	
值范围 %c##~##
	- OCTAL = "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7"与OCTAL = %x30-37等价
	
序列组合 ()：讲规则组合起来，看作单个元素

不定量重复 m*n：
	- * 表示零个或多个元素：*( header-field CRLF )
	- 1* 表示一个或多个元素，2*4 表示两个到四个元素
	
可选序列 []：
	- [ message-body ]
	
OCTET 	= <任意8位的二进制数据>
CHAR  	= <任意ASCII字符 (0-127)>
UPALPHA	= <任意ASCII 大写字母 A..Z>
LOALPHA	= <任意ASCII 小写字母 a..z>
ALPHA	= UPALPHA | LOALPHA
DIGIT	= <任意0-9>
DQUOTE	双引号
SP		空格
HTAB	horizontal tab
WSP		SP / HTAB
LWSP	*(WSP/CRLF WSP)
HEXDIG  %DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
CTL		%x00-1F / %x7F	控制字符
CR		%x0D				回车 carriage return
LF		%x0A				换行 line feed
CRLF	= CR LF

HTTP-message = start-line *( header-field CRLF ) CRLF [ message-body ]
	start-line = request-line / status-line
		request-line = method SP request-target SP HTTP-version CRLF
		status-line	 = HTTP-version SP status-code SP reason-phrase CRLF
		
	header-field = field-name ":" OWS field-value OWS
		field-name = token
		field-value = *( filed-content / obs-fold )
		
	message-body = *OCTET(二进制传递的)
```

一个例子

```bnf
HTTP/1.1 200 OK                                                                 Server: openresty/1.15.8.3                                                       Date: Sun, 26 Jul 2020 12:42:22 GMT
Content-Type: text/css
Content-Length: 108
Last-Modified: Thu, 27 Dec 2018 07:35:33 GMT
Connection: keep-alive
ETag: "5c2480c5-6c"
Expires: Sun, 02 Aug 2020 12:42:22 GMT
Cache-Control: max-age=604800
Accept-Ranges: bytes                                                                                                                                       pre.pure-highlightjs {                                                           	background-color: transparent !important;
	border: none;
	padding: 0;
} 
```





1. Message Types

```bnf
HTTP-message = Request | Response ; HTTP/1.1 messages

generic-message = start-line
				  *(message-header CRLF)
				  CRLF
				  [ message-body ]
start-line		= Request-Line | Status-Line 
```

接收HTTP stream时，没接收到有效信息之前，忽略所有CRLF

2. Message Headers

   ```bnf
   message-header = field-name ":" [ field-value ]
   field-name     = token
   field-value	   = *( field-content | LWS )
   ```

   

3. 23

4. 23









```bnf

```



