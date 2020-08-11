const css = require('css')

const EOF = Symbol("EOF")

const layout = require("./layout.js")

let currentToken = null
let currentAttribute = null

let stack = [{type: "document", children: []}]
let currentTextNode = null

let rules = []
function addCssRules(text) {
    var ast = css.parse(text)
    rules.push(...ast.stylesheet.rules)
    console.log(rules)
}

/**
 * @selector 假设都是简单选择器 #id .class tag
 * 
 */
function match(element, selector) {
    if (!selector || !element.attributes)   // 文本节点
        return false

    if (selector.charAt(0) == "#") {    // id selector
        let attr = element.attributes.filter(attr => attr.name === "id")
        if (attr && attr.value === selector.replace("#", ''))
            return true
    } else if (selector.charAt(0) == ".") {
        let attr = element.attributes.filter(attr => attr.name === "class")
        if (attr && attr.value === selector.replace(".", ''))
            return true
    } else {
        if (element.tagName === selector) {
            return true
        }
    }

    return false
}

/**
 * 优先级计算   [inline, id, class, tag]
 */
function specificity(selector) {
    let p = [0, 0, 0, 0]
    let selectorParts = selector.split(" ")
    for (var part of selectorParts) {
        if (part.charAt(0) == "#") {
            p[1] += 1;
        } else if (part.charAt(0) == ".") {
            p[2] += 1
        } else {
            p[3] += 1
        }
    }

    return p
}

/**
 * 优先级比较
 */
function compare(sp1, sp2) {
    if (sp1[0] - sp2[0])
        return sp1[0] - sp2[0]
    if (sp1[1] - sp2[1])
        return sp1[1] - sp2[1]
    if (sp1[2] - sp2[2])
        return sp1[2] - sp2[2]

    return sp1[3] - sp2[3]
}

function computeCss(element) {
    // stack --> [document, html, head, style]  一定是根style先匹配
    let elements = stack.slice().reverse()
    if (!element.computedStyle)
        element.computedStyle = {}


    for (let rule of rules) {
        // #container #myid --> [#myid, #container]
        let selectorParts = rule.selectors[0].split(" ").reverse()
        if (!match(element, selectorParts[0]))
            continue;

        let matched = false;

        let j = 1;
        // elements ["html", "document"]    selectorParts [#myid, #container]
        for (let i = 0; i < elements.length; i++ ) {    
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        // 所有选择器是否都已匹配
        if (j >= selectorParts.length)
            matched = true

        if (matched) {
            let sp = specificity(rule.selectors[0])
            let computedStyle = element.computedStyle;
            for (let declaration of rule.declarations) {
                if (!computedStyle[declaration.property])
                    computedStyle[declaration.property] = {}

                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {  // 优先级高的覆盖
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
                
            }
            console.log("element.computedStyle", element.computedStyle)
        }
    }
}
 
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

        computeCss(element)

        if (!token.isSelfClosing)
            stack.push(element)

        currentTextNode = null
    } else if (token.type == "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!")
        } else {
            // 遇到style标签，添加CSS规则
            if (top.tagName == "style") {
                addCssRules(top.children[0].content)
            }
            // 在元素pop之前，计算该元素位置
            layout(top);
            stack.pop();
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
        return ;
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

function selfClosingStartTag(c) {
    if (c == ">") {
        currentToken.isSelfClosing = true;
        emit(currentToken)
        return data
    } else if (c == "EOF") {

    } else {

    }
}


module.exports.parseHTML = function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state(c)
    }
    state = state(EOF)
    return stack[0]
}