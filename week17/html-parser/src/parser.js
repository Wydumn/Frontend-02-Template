let stack = null;
let currentToken = null
let currentAttribute = null
let currentTextNode = null

function emit(token) {
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
                element.attributes.push({   // contetn等其他属性
                    name: p,
                    value: token[p]
                })
        }

        // 双向链表
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
    } else if (token.type == "text") {
        if (currentTextNode == null) {
            currentTextNode = {
                type: "text",
                content: ""
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }


}

const EOF = Symbol("EOF")

// data state
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
        emit({
            type: "text",
            context: c
        })
        return data;
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName : ""
        }
        return tagName(c)
    } else if ( c == EOF ) {

    } else if ( c == ">" ) {

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

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {   // reConsume
        return beforeAttributeName;
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c)
    } else if (c == "=") {
        return beforeAttributeName
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

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {

    } else if (c == "/") {
        return selfClosingStartTag
    } else if (c == "=") {
        return beforeAttributeValue
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

function singleQuotedAttributeValue(c) {
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
        throw new Error("unexpected character \"" + c + "\"");
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


export function parseHTML(html) {

    stack = [{type: "document", children: []}];
    currentToken = null
    currentAttribute = null
    currentTextNode = null

    let state = data;
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)

    return stack[0]
} 