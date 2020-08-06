### 1. 收集CSS规则

1. 遇到`style`标签，把CSS规则保存起来

2. 调用`CSS parser`来分析CSS规则

3. **要仔细看`css`包分析CSS规则的格式**

   ```js
   let rules = []
   function addCssRules(text) {
       var ast = css.parse(text)
       console.log(JSON.stringify(ast, null, "   "))
       // 收集规则添加到rules
       rules.push(...ast.stylesheet.rules)
   }
   
   function emit() {
   	if (token.type == "endTag") {
           if (top.tagName != token.tagName) {
               throw new Error("Tag start end doesn't match!")
           } else {
               // 遇到style标签，添加CSS规则
               if (top.tagName == "style") {
                   addCssRules(top.children[0].content)
               }
               stack.pop()
       	}
   	}    
   }
   
   ```



### 2. 添加调用

1. 当我们创建一个元素后，立即计算CSS

2. 理论上，分析一个元素时，所有CSS规则已经收集完了

3. 这里忽略写在body中的style

   ```js
   function emit(token) {
       
       let top = stack[stack.length - 1]
   
       if (token.type == "startTag") {
           let element = {
               type: "element",
               children: [],
               attributes: []
           }
   
           element.tagName = token.tagName
   
           for (let p in token) {
               if (p != "type" && p != "tagName")
                   element.attributes.push({ 
                       name: p,
                       value: token[p]
                   })
           }
   
           top.children.push(element)
           element.parent = top;   
   		
           // 在startTag中获得element后，立即计算css
           computeCss(element)
   
           if (!token.isSelfClosing)
               stack.push(element)
   
           currentTextNode = null
       } else if () {
          ...
   	}
   }
   ```

   

### 3. 





### 4. 选择器与元素的匹配

1. 选择器从当前元素向外排列
2. 复杂选择器拆成针对单个元素的选择器，用循环匹配父元素队列

```js
function match(element, selected) {

}

function computeCss(element) {
    // stack --> [document, html, head, style]  一定是根style先匹配
    var elements = stack.slice().reverse()
    if (!element.computedStyle)
        element.computedStyle = {}


    for (let rule of rules) {
        // #container #myid --> [#myid, #container]
        var selectorParts = rule.selectors[0].split(" ").reverse()
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
            console.log("Element", element, "matched rule", rule)
        }
    }
}
```



### 5. 计算选择器与元素匹配

- 根据选择器的类型和元素属性，计算是否与当前元素匹配

```js
/**
 * @selector 假设都是简单选择器 #id .class tag
 * 
 */
function match(element, selector) {
    if (!selector || !element.attributes)   // 文本节点
        return false

    if (selector.charAt(0) == "#") {    // id selector
        let attr = element.attributes.filter(attr => attr.name === "id")[0]
        if (attr && attr.value === selector.replace("#", ''))
            return true
    } else if (selector.charAt(0) == ".") {
        let attr = element.attributes.filter(attr => attr.name === "class")[0]
        if (attr && attr.value === selector.replace(".", ''))
            return true
    } else {
        if (element.tagName === selector) {
            return true
        }
    }

    return false
}
```



### 6. 生成computed属性



```js
function computeCss() {
	...
    if (matched) {
        let computedStyle = element.computedStyle;
        for (let declaration of rule.declaration) {
            if (!computedStyle[declaration.property])
                computedStyle[declaration.property] = {}

            computedStyle[declaration.property].value = declaration.value
        }
        console.log(element.computedStyle)
    }
}
```





### 7. specificity的计算

1. CSS规则根据specificity和后来优先规则覆盖
2. specificity是一个四元组，越靠左，权重越高
3. 一个CSS规则的specificity根据包含的简单选择器相加而成

```js

```

