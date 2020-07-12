1. 语言按语法分类
   1. 非形式语言
      - 中文、英文等自然语言
   2. 形式语言（乔姆斯基谱系）
      1. 0型	无限制文法
      2. 1型    上下文相关文法
      3. 2型    上下文无关文法
      4. 3型    正则文法
2. 产生式(BNF)
   1. 用尖括号括起来的名称来表示语法结构名
   2. 语法结构分成基础结构和需要用其他语法结构定义的复合结构
      1. 基础结构成为终结符(Terminal Symbol)
      2. 复合结构称为非终结符
   3. 引号和中间的字符表示终结符
   4. 可以有括号
   5. *表示重复多次
   6. +表示至少一次
   7. |表示或
3. 类型
   1. Number
      - 遵循[ `IEEE 754-2008 `标准](https://zh.wikipedia.org/zh-hans/IEEE_754)
      - ![](D:\Project\Frontend-02-Template\week02\1024px-IEEE_754_double_precision.svg.png)
        1. `MAX_SAFE_INTEGER 是一个值为 9007199254740991的常量。因为Javascript的数字存储使用了`[IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point)中规定的[双精度浮点数](https://zh.wikipedia.org/zh-cn/雙精度浮點數)数据类型，而这一数据类型能够安全存储 `-(2^53 - 1)` 到 `2^53 - 1 之间的数值（包含边界值）` 
        
        2. 浮点数？？
        
           >  浮点数运算的精度问题：`console.log( 1.1 + 2.2 == 3.3 )`结果为`false`，但是因为浮点数表示本身的问题，结论是成立的，但是方法不对 ---
           >
           > `console.log( Math.abs(0.1 + 0.2 - 0.3) <= Number.EPSILON)`
           >
           > 在精度EPSILON范围内，可以接受
        
        3. 特殊情况
        
           1.  NaN
           2.  Infinity 无穷大
           3.  -Infinity 负无穷大
        
        4.  Notion:
        
            > 除法计算中，有+0、-0的区分，1/-0 得到的是 `-Infinity`
        
        5.  语法
        
            1.  十进制  
                1.  `0`
                2.  `0.`
                3.  `.2`
                4.  `1e3`
            2.  二进制            `0b01`
            3.  八进制            `0o1234567`
            4.  十六进制        `0x1234567890abcdef`
            5.  语法冲突：`0.toString()`，`0.`是10进制数时，`.`不再是属性运算符，所以会出错，一般加个空格`0. toString()`
      
   2. String
   
      1. 字符集
   
         1. ASCII、Unicode、UCS、GB（GB2312、GBK(GB13000)、GB18030）、ISO-8859、BIG5
   
         2. 继承自JAVA，JS的string类型使用的是字符串的`UTF-16`编码
   
            > Note：现行的字符集国际标准，字符是以 Unicode (encoding) 的方式表示的，每一个 Unicode 的码点 (code point) 表示一个字符，理论上，Unicode 的范围是无限的。UTF 是 Unicode 的编码方式，规定了码点在计算机中的表示方法，常见的有 UTF16 和 UTF8。 Unicode 的码点通常用 U+??? 来表示，其中 ??? 是十六进制的码点值。 0-65536（U+0000 - U+FFFF）的码点被称为基本字符区域（BMP）。
   
         3. JavaScript 中的字符串字符串具有值类型的特征，一旦字符串构造出来，无法用任何方式改变字符串的内容
   
      2. [Encoding]( http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html )
   
         1. ![](D:\Project\Frontend-02-Template\week02\utf.png)
   
            utf-`8`，8位表示一个字节，也就是一个字符，所以兼容ASCII，
   
            utf-`16`，2个字节表示一个字符
   
         2. ![](D:\Project\Frontend-02-Template\week02\控制位.png)
   
            对于表示不下的字符，会采用**控制位**来扩展字符集
   
      3. 转义字符
   
         1. bfnrtv
         2. \x和\u转义的规则
   
   3. Boolean
   
      - true、false
   
   4. Null & Undefined
   
      > null是一个关键字，undefined是一个全局变量 `window.undefined `，所以会出现undefined = xxx这样的赋值情况，并且it works，所以一般用`void`这个运算符来得到一个undefined，
   
   5. Object
   
      1. 认知的定义，更像一个研究对象`target`：state、identifier、behavior
   
         1. 对象机制分类
   
            1. 归类 -- class
   
               > 继承
   
            2. 分类 -- prototype
   
               >  任何对象仅仅描述与原型的区别
   
         2. 对于上面的要素，在设计对象的状态和行为时，总是遵循“行为改变状态”的原则。
   
      2. JavaScript中的对象
   
         1. 对象是一个属性的集合。
            1. 使用属性来表示状态，函数来表示行为，"first class function"使得状态和行为都可以由属性来统一表示
            2. 内存地址的唯一性来表示对象的唯一性
            3. 所以，原生对象只需关心原型prototype和属性property两部分
   
      3. 23
   
   6. Symbol
5. 23
6. 