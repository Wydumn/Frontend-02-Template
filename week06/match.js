function match(selector, element) {

    // 1. 当前元素是否匹配规则
    const rule = selectorParse(selector)

    // 否，规则中是否有同级元素规则

    // 2.1 同级元素匹配 + ~

    // 2.2 同级元素不匹配

    // 3.1 当前元素子元素是否匹配   > 

    // 3.2 当前元素同级元素子元素是否匹配   

    // 4 列选择器   || 

    // ...

    // 后代是否匹配 space(不需要明确父子关系)

    return true;
}

// 状态机解析selector语法
function selectorParse(selector) {
    let rule = {
        current: {},
        siblings: {},
        children: {},
        descendant: {},
    }

    for (const s of selector) {
        if (s === '*') {
            rule.wildcard = true
        }
    }

    return rule
}

match("div #id.class", document.getElementById("id"))