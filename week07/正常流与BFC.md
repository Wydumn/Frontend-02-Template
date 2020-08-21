### 1. normal flow





### concept

1. **包含块（containing blocks）**

   > 在CSS2.1中，许多盒子的定位和尺寸根据contianing block盒子的边来计算。一般来说，生成的盒子作为后代盒子的containing blocks.我们称一个盒子为它的后代构建了containing block。一个盒子的containing block意思就是盒子在该containing block内排布，而不是它生成了containing block.

   每个盒子根据它的containing block进行定位，但不被containing block所限制，盒子可以overflow.

2. 23



一个盒子的类型部分地影响它在**视觉格式化模型(Visual Formatting Model)**中的行为。`display`属性指定盒子的类型。

block-level element和block boxes

`display`属性为block、list-item、table的元素是**块级元素（block-level element）**。

**块级盒子（block-level boxes）**是参与块级格式化上下文（block formatting context）的盒子。每个块级元素生成一个包含后代盒子和生成内容的**主块级盒子（principal block-level box）**，主块级盒子也参与定位方案。一些块级元素（`list-item`元素）除了主块级盒子外可能生成其他的盒子，这些盒子是相对于主盒子定位的。



