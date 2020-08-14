// 这个就是实现第五周第5节：计算选择器与元素匹配   ？？！
// 那不就是写一个css selector的解析器吗？？！
function match(selector, element) {
    selector = selector.replace(/(^\s*)|(\s*$)/g, "");  // 去除字符串首尾空格
    var rules = selectorParse(selector);

    let res;
    for (let i = 0; i < rules.length; i++) {
        res = currentMatch(rules[i], element);

        if (i == 0) {   // 当前元素
            element = res ? element.childNodes : [];
        } else if (i === rules.length ) {
            element = res;
        } else {
            element = [];
            for (const ele of res) {
                element.push(ele.childNodes)
            }
        }
    }

    return element.length > 0;
}

// 当前元素是否匹配
function currentMatch(rule, elements) {
    let matchedElements = []
    for (const element of elements) {
        if (rule.type == 'class' || rule.type == 'id') {
            rule.reg == element.getAttribute(rule.type) ? matchedElements.push(element) : null
        } else {
            rule.reg == element.tagName ? matchedElements.push(element) : null
        }
    }

    return matchedElements
}


// 只考虑类型、类、id选择器这三个简单选择器
function selectorParse(selector) {

    var rule = [];
    var selectorParts = selector.split(' ');

    let i = 0;
    for (const selecotrPart of selectorParts) {
        i++;
        if (selecotrPart.chatAt(0) == '.') {    // 类选择器
            rule.push({ type: 'class', 'reg': selecotrPart })
        }
        if (selecotrPart.chatAt(0) == '#') {
            rule.push({ type: 'id', 'reg': selecotrPart })
        }
        if (selecotrPart.match(/^\w+$/)) {
            rule.push({ type: 'tag', 'reg': selecotrPart })
        }
    }

    return rule
}

match("div #id.class", document.getElementById("id"))