### 1. Normal flow

正常流排版是浏览器最基本的排版方式。之后才出现flex、grid等强大的排版方案。

我们正常写字的顺序：

1. 从左向右
2. 同一行写的文字是对齐的
   1. 中文，上下对齐方格
   2. 英文，对齐基线
3. 一行写满，换行

相似地，正常流作为最基本的排版方式，和日常写字的排版很像，但是浏览器支持图片等**元素和文字混排**时，元素盒子模型与文字的处理有些差异：

1. 收集盒和文字进行
2. 计算盒在行中的排布
3. 计算行的排布



> **定义**：文字依次书写的延伸方向称为主轴，换行延伸的方向，跟主轴垂直交叉，称为交叉轴



#### 1. 盒模型

CSS选择器选中的元素，在排版时可能产生多个盒。排版和渲染的基本单位是盒。

盒模型

![](D:\Project\Frontend-02-Template\week07\box model.png)

设置`box-sizing`时，

> border-box = margin + border + padding + content
>
> content-box = content

主轴方向占据的空间由margin、border、padding、width/height等属性在**主轴方向的和**决定，**`vertical-align`属性决定盒的交叉轴方向**位置，也影响行高。



元素的位置由`position`和`display`两个属性来确定。作为初代布局方案，定位方式有：

1. `position: static`（默认定位方式）
2. `position: relative`
3. `position: absolute`（`fixed`也是相同原理）
4. `float:  left / right / none / inherit `

`static`和`relative`，元素还**在正常流中**，而`float`、`absolute`和`fixed`的元素**脱离了正常流**。absolute元素完全和正常流无关；`float`元素先排入正常流，再移动到主轴的最前或最后；`float`元素排布完成后，`float`元素所在的行需要重新确定位置。





#### 2. 行内排布

行内的排布(inline-level formatting context)

![1597462226408](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1597462226408.png)

**base-line与行模型**

![1597462078003](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1597462078003.png)

1. base-line主要用来对齐英文字符;
2. text-top、text-bottom字符的大小不变，两根线也不变；多种文字混排，text-top、text-bottom根据最大的字体进行调整。
3. line-top、line-bottom解决文字与盒子混合排版的问题：如果用text-top、text-bottom对齐盒子，盒子太大，会把这两根线撑的很大。



文字的表示：横排纵排两种，bearing表示字间距，一个字符所占空间为advance，origin表示基线的位置

![1597462591466](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1597462591466.png)



#### 3. 块级排布

行的排布（ block-level formatting context ）

![1597462298129](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1597462298129.png)

行内排布：文字和`inline-box`排成的行就是`line-box`，



1. float
2. BFC
3. margin Collapse



### 2. BFC

1. 概念：
   - block container：里面有BFC
     - block
     - inline-block
     - table-cell
     - flex-item
     - grid cell
     - table-caption
   - block-level box：外面有BFC
     - 
   - block box = block container + block-level box：里外都有BFC
   - 
2. 23













### 4. css 动画

JS动画和CSS动画有什么区别

- [hsl与hsv]( https://zhuanlan.zhihu.com/p/67930839 )

  > Hue 色相 	saturation 纯度	lightness 明度	value 明度

  W3C用的是HSL表示。

![](D:\Project\Frontend-02-Template\week07\hsl、hsv.png)

![](D:\Project\Frontend-02-Template\week07\hsl.png)

例子： 

1. `filter: hue-rotate(240deg); `如果当前图片为红色，可以变为绿色。
2. 一键更换主题？？



参考：

- [CSS Visual Formatting Model]( https://dondevi.github.io/css-visual-formatting-model.html )
- [视觉格式化模型]( https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Visual_formatting_model )























