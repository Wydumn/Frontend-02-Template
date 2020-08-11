



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
            element.style[prop] = parseInt(element.style[prop])
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

    var items = element.children.filter(e => e.type === 'element')

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

    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace
    } else {    // 新行
        flexLine.crossSpace = crossSpace
    }

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

    console.log("items", items)
}

module.exports = layout