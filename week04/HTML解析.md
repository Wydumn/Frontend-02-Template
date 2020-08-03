### 1. HTML parse模块拆分

- rser接受HTML文本作为参数，返回DOM树

  ```parser.js
  module.exports.parseHTML = function parseHTML(html){
      
  }
  ```

### 2. FSM实现HTML分析

1. [HTML标准]( https://html.spec.whatwg.org/multipage/parsing.html#tokenization )中规定好了HTLM的状态
2. 只挑选一部分状态，完成最简版本

```parser.js
const EOF = Symbol("EOF")

function data(c) {

}

module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
}
```

>  The "EOF" character in the tables below is a conceptual character representing the end of the [input stream](https://html.spec.whatwg.org/multipage/parsing.html#input-stream). If the parser is a [script-created parser](https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#script-created-parser), then the end of the [input stream](https://html.spec.whatwg.org/multipage/parsing.html#input-stream) is reached when an explicit "EOF" character (inserted by the `document.close()` method) is consumed.  

### 3. 解析标签

1. 主要的标签：start tag、end tag、self-closing tag
2. 暂时忽略属性

```js
const EOF = Symbol("EOF")

function data(c) {
    if (c == "<") {
        return tagOpen;
    } else if (c == EOF) {
        return ;
    } else {
        return data;
    }
}

function tagOpen(c) {
    if (c == "/") { // </
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {  // <h <a <b ...
        return tagName(c)
    } else {    // <# <$ ...
        return ;
    }
}

function endTagOpen() {
    if (c.match(/^[a-zA-Z]$/)) {
        return tagName(c)
    } else if ( c == EOF ) {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {   // \t \n \f（换页符） " " 空白符
        return beforeAttributeName;
    } else if (c == "/") {  // <br /   < hr /   ...
        return selfClosingStartTag
    } else if (c.match(/^[a-zA-Z]$/)) { // <htm
        return tagName
    } else if (c == ">") {
        return data
    } else {
        return tagName
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "=") {
        return beforeAttributeName
    } else {
        return beforeAttributeName
    }
}

function selfClosingStartTag(c) {
    if (c == ">") {
        currentToken.isSelfClosing = true;
        return data
    } else if (c == "EOF") {

    } else {

    }
}
```



### 4. 创建元素

1. 在状态机中，除了状态转移，加入计算逻辑
2. 在标签结束状态提交(emit) token

```js
let currentToken = null

function emit(token) {

    console.log(token)
}

const EOF = Symbol("EOF")

function data(c) {
    if (c == "<") {
        return tagOpen;
    } else if (c == EOF) {
        emit({
            type: "EOF"
        })
    } else {
        emit({
            type: "text",
            content: c
        })
        return data
    }
}

function tagOpen(c) {
    if (c == "/") { // </
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {  // <h <a <b ...
        currentToken = {
            type: "startTag",
            tagName: ""
        }
        
        return tagName(c)
    } else {    // <# <$ ...
        return ;
    }
}

function endTagOpen() {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName : ""
        }
        return tagName(c)
    } else if ( c == EOF ) {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {   // \t \n \f（换页符） " " 空白符
        return beforeAttributeName;
    } else if (c == "/") {  // <br /   < hr /   ...
        return selfClosingStartTag
    } else if (c.match(/^[a-zA-Z]$/)) { // <htm
        currentToken.tagName += c
        return tagName
    } else if (c == ">") {
        emit(currentToken)
        return data
    } else {
        return tagName
    }
}
```



### 5. 属性处理

1. 属性值分为[单引号]( https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(single-quoted)-state )、[双引号]( https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(double-quoted)-state )、[无引号]( https://html.spec.whatwg.org/multipage/parsing.html#attribute-value-(unquoted)-state )三种
2. 处理方式与标签类似
3. 属性结束时，把属性加到Token上

```js
function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {   // reConsume
        return beforeAttributeName;
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
    } else if (c == "=") {

    } else {
        currentAttribute = {
            name: "",
            value: ""
        }

        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF ) {  //  <div class="xxx"
        return afterAttributeName(c)
    } else if (c == "=") {
        return beforeAttributeValue
    } else if (c == "\u0000") { // 空格

    } else if (c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c;
        return attributeName
    }
}

// https://html.spec.whatwg.org/multipage/parsing.html#after-attribute-name-state
function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {

    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == "=") {
        return beforeAttributeName
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if (c == EOF) {
        emit({
            type: "EOF"
        })
    } else {
        currentAttribute = {
            name: "",
            value: ""
        }

        return attributeName(c)
    }
}


function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue
    } else if (c == "\"") {
        return doubleQuotedAttributeValue
    } else if (c == "\'") {
        return singleQuotedAttributeValue
    } else if (c == ">") {
        // return data
    } else {
        return UnquotedAttributeValue(c)
    }
}

function doubleQuotedAttributeValue(c) {
    if ( c == "\"" ) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue() {
    if (c == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if (c == "\u0000") {

    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName;
    } else if ( c == "/" ) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if ( c == ">" ) {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if ( c == "\u0000" ) {

    } else if ( c == "\"" || c == "'" || c == "<" || c == "=" || c == "`") {

    } else if ( c == EOF ) {

    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {   // multi attribute
        return beforeAttributeName
    } else if (c == "/") {  // <hr align="xxx" /
        return selfClosingStartTag
    } else if (c == ">") {  // <img src="xxx">
        currentToken[currentAttribute.name] = [currentAttribute.value]
        emit(currentToken)
        return data
    } else if (c == EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuotedAttributeValue
    }
}
```



 ### 6. token创建DOM树

使用栈创建DOM树：

1. 开始标签入栈，结束标签出栈
2. self closing节点入栈立即出栈
3. 任何元素的父元素是它入栈前的栈顶元素

```JS
let stack = [{type: "document", children: []}]

function emit(token) {
    if (token.type === "text") {
        return;
    }
    // 栈顶元素
    let top = stack[stack.length - 1]

    // 根据token生成DOM节点
    if (token.type == "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        }

        element.tagName = token.tagName

        for (let p in token) {
            if (p != "type" && p != "tagName")
                element.attributes.push({   // 其他属性
                    name: p,
                    value: token[p]
                })
        }

        // 双向链表绑定父子节点
        top.children.push(element)
        element.parent = top;   

        if (!token.isSelfClosing)
            stack.push(element)

        currentTextNode = null
    } else if (token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!")
        } else {
            stack.pop()
        }
        currentTextNode = null
    }
}
```



### 7. 文本节点的处理



```js
 if (token.type == "endTag") {
     if (top.tagName != token.tagName) {
         throw new Error("Tag start end doesn't match!")
     } else {
         stack.pop()
     }
     currentTextNode = null
 } else if (token.type == "text") {
     if (currentTextNode == null) {
         currentTextNode = {
             type: "text",
             content: ""
         }
         top.children.push(currentTextNode)
     }
     currentTextNode.content += token.content	// 多个文本节点需要合并
 }
```















### 参考

1. [Tokenization]( https://html.spec.whatwg.org/multipage/parsing.html#tokenization )

