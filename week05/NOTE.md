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

- 一旦选择匹配，就应用选择器到元素上，形成computedStyle

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
/**
 * 优先级计算
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
    ...
    
    if (matched) {
        let sp = specificity(rule.selectors[0])
            let computedStyle = element.computedStyle;
            for (let declaration of rule.declarations) {
                if (!computedStyle[declaration.property])
                    computedStyle[declaration.property] = {}

                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if (compare(computedStyle[declaration.property].specificity) < 0) {  // 优先级高的覆盖
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
                
            }
    }
}
```



### 8. 根据浏览器属性进行排版

这里选择用flex布局进行排版

![1596723209544](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1596723209544.png)

因为flex布局需要知道子元素的，所以布局计算应在结束标签之前进行

```js




/**
 *  将代码字符串转换为样式键值对
 */
function getStyle(element) {
    if (!element.style)
        element.style = {}

    for (let prop in element.computedStyle) {
        let p = element.computedStyle.value
        element.style[prop] = element.computedStyle[prop].value


        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop].value)
        }

        if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
    }

    return element.style
}

function layout(element) {
    // preprocess
    if (!element.computedStyle)
        return;

    let elementStyle = getStyle(element)

    if (elementStyle.display !== 'flex')
        return;

    let items = element.children.filter(e => e.type === 'element')

    items.sort((a, b) => (a.order || 0) - (b.order || 0))   // flex元素的order属性

    let style = elementStyle

    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })

    if (!style.flexDirection || style.flexDirection === 'auto')
        style.flexDirection = 'row';
    if (!alignItems || style.alignItems === 'auto')
        style.alignItems = 'stretch';
    if (!style.justifyContent || style.justifyContent == 'auto')
        style.justifyContent = 'flex-start';
    if (!style.flexWrap || style.flexWrap === 'auto')
        style.flexWrap = 'nowrap';
    if (!style.alignContent || style.alignContent === 'auto')
        style.alignContent = 'stretch';

    var mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase
    if (style.flexDirection === 'row') {    // 主轴为水平方向
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;  // 从右往左一像素一像素画
        mainBase = style.width

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if (style.flexWrap === 'wrap-reverse') {    // cross-start 和 cross-end 互换
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = 1;
    }

}
```





### 9.  收集元素进行

![1596755725443](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1596755725443.png)

1. 根据主轴尺寸，把元素分进行

2. 若设置了`no-wrap`，则强行分配进第一行

3. 可以换行（非`no-wrap`）：

   1. 当前行的剩余空间（`mainSpace`）放不下当前元素flex item（`itemStyle[mainSize]`）时，新起一行`flexLine[item]`
   2. 元素尺寸超过一行的尺寸

   ```js
   function layout() {
       ...
       
       let isAutoMainSize = false;     // 父元素未设置主轴尺寸的情况 auto size
       if (!style[mainSize]) {
           // 转换为键值对后的样式
           elementStyle[mainSize] = 0; // 主轴
           for (let i = 0; i < items.length; i++) {    //遍历子元素算得父元素主轴size
               let item = items[i];
               if ( itemStyle[mainSize] !== null || itemStyle[mainSize] !== 'auto' ) {
                   elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]   // itemStyle...,下面会定义
               }
           }
           isAutoMainSize = true;
       }
   
       let flexLine = [];
       let flexLines = [flexLine];
   
       let mainSpace = elementStyle[mainSize];
       let crossSpace = 0;
   
       for (let i = 0; i < items.length; i++) {
           let item = items[i];
           var itemStyle = getStyle(item)
   
           if (itemStyle[mainSize] === null) {
               itemStyle[mainSize] = 0;
           }
   
   
           if (itemStyle.flex) {   // 有flex属性就一定在行内
               flexLine.push(item);
           } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
               mainSpace -= itemStyle[mainSize];   // 剩余空间
               if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                   crossSpace = Math.max(crossSpace, itemStyle[crossSize]) // 主轴单元中交叉轴方向尺寸最大的元素作为交叉轴尺寸
               flexLine.push(item)
           } else {
               if (itemStyle[mainSize] > style[mainSize]) {    // 子元素size > 父元素 size, 压进行
                   itemStyle[mainSize] = style[mainSize]
               }
               if (mainSpace < itemStyle[mainSize]) {  // 主轴放不下，换行
                   flexLine.mainSpace = mainSpace
                   flexLine.crossSpace = crossSpace
                   flexLine = [item]
                   flexLines.push(flexLine)
                   mainSpace = style[mainSize]
                   crossSpace = 0;
               } else {    // 能放下
                   flexLine.push(item)
               }
   
               if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) 
                   crossSpace = Math.max(crossSpace, itemStyle[crossSize])
   
               mainSpace -= itemStyle[mainSize]
           }
       }
       flexLine.mainSpace = mainSpace
   
       ...
   }
   ```

   

   

   ### 10. 计算主轴

   ![1596938230208](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1596938230208.png)

   1. 找出所有Flex元素
      1. 把主轴方向的剩余尺寸按比例分配给这些元素
      2. 若剩余空间为负数，所有flex元素为0，等比例压缩剩余元素
   2. 没有Flex元素
      1. 23

   ```js
   function layout() {
       
       ...
       
    	if (mainSpace < 0) {
           // overflow (happens only if container is single line), scale every item
           let scale = style[mainSize] / (style[mainSize] - mainSpace)
           let currentMain = mainBase  // style.width 或 style.height
           for (let i = 0; i < items.length; i++) {
               let item = items[i];
               let itemStyle = getStyle(item)
   
               if (itemStyle.flex) {
                   itemStyle[mainSize] = 0;
               }
               // width 或 height
               itemStyle[mainSize] = itemStyle[mainSize] * scale;
   
               // left\right、right\left 或 top\bottom、bottom\top
               itemStyle[mainStart] = currentMain;
               itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
               currentMain = itemStyle[mainEnd]             
           }
       } else {
           flexLines.forEach((items) => {
               let mainSpace = items.mainSpace;
               let flexTotal = 0;
   
               for (let i = 0; i < items.length; i++) {
                   let item = items[i];
                   let itemStyle = getStyle(item)
   
                   if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
                       flexTotal += itemStyle.flex
                       continue;
                   }
               }
   
               if (flexTotal > 0) {    // 有flex元素的情况，flex元素按比例分配
                   let currentMain = mainBase
                   for (let i = 0; i < items.length; i++) {
                       let item = items[i];
                       let itemStyle = getStyle(item)
   
                       if (itemStyle.flex) {   
                           itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
                       }
   
                       itemStyle[mainStart] = currentMain
                       itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                       currentMain = itemStyle[mainEnd]
                   }
               } else {    // 没有flex元素的情况，根据justify-content属性进行分配
                   if (style.justifyContent === 'flex-start') {
                       var currentMain = mainBase;
                       var step = 0;
                   }
                   if (style.justifyContent === 'flex-end') {
                       var currentMain = mainSpace * mainSign + mainBase
                       var step = 0;
                   }
                   if (style.justifyContent === 'center') {
                       var currentMain = mainSpace / 2 * mainSign + mainBase
                       var step = 0;
                   }
                   if (style.justifyContent === 'space-between') {
                       var step = mainSpace / (items.length - 1) * mainSign
                       var currentMain = mainBase
                   }
                   if (style.justifyContent === 'space-around') {
                       var step = mainSpace / items.length * mainSign
                       var currentMain = step / 2 + mainBase
                   }
                   for (let i = 0; i < items.length; i++) {
                       let item = items[i];
                       itemStyle[mainStart] = currentMain
                       itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                       currentMain = itemStyle[mainEnd] + step;
                   }
               }
           })
       }
       
       ...
   }
   ```

   





### 11. 计算交叉轴

![1596938159518](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1596938159518.png)

```js
function layout() {
    ...
    
    // 计算交叉轴尺寸
    
    if (!style[crossSize]) {    // auto sizing
        crossSpace = 0;
        elementStyle[crossSize] = 0;

        for (let i = 0; i < flexLines.length; i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
        }
    } else {
        crossSpace = style[crossSize]
        for (let i = 0; i < flexLines.length; i++) {
            crossSpace -= flexLines[i].crossSpace
        }
    }

    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize]
    } else {
        crossBase = 0;
    }
    var lineSize = style[crossSize] / flexLines.length

    var step;
    if (style.alignContent === 'flex-start') {
        crossBase = 0;
        step = 0;
    }
    if (style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if (style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }
    if (style.alignContent === 'space-between') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if (style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length)
        crossBase += crossSign * step / 2;
    }
    if (style.alignContent === 'stretch') {
        crossBase += 0;
        step = 0;
    }

    flexLines.forEach((items) => {  
        var lineCrossSize = style.alignContent === 'stretch' ?
            items.crossSpace + crossSpace / flexLines.length :
            items.crossSpace;

        for (let i = 0; i < items.length; i++) {    // 遍历该行内所有元素
            let item = items[i];
            let itemStyle = getStyle(item);

            let align = itemStyle.alignSelf || style.alignItems;

            if (item === null) {    // 间隔分配剩余空间
                itemStyle[crossSize] = (align === 'stretch')
                    ? lineCrossSize
                    : 0
            }

            if (align === 'flex-start') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }

            if (align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
            }

            if (align === 'center') {   // 剩余空间
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }

            if (align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize)
                // 你这行代码有啥用啊？
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
            }
        }
        crossBase += crossSign * (lineCrossSize + step)
    })
    
    ...
}
```





### 12. 绘制单个元素

1. 引用`images`包来提供图形环境
2. 绘制在一个viewport上进行

```js

```

