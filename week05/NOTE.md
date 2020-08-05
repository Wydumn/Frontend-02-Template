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