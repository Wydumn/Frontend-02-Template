![](D:\Project\Frontend-02-Template\week03\type convertion.png)



1. `StringToNumber`

   1. ```g4
      numericLiteral
          : DecimalLiteral
          | HexIntegerLiteral
          | OctalIntegerLiteral
          | OctalIntegerLiteral2
          | BinaryIntegerLiteral
      ```

      进制数转换

   2. 科学计数法转换

      ```g4
      fragment ExponentPart
       : [eE] [+-]? DecimalDigit+
       ;
      ```

   3. 方法

      1. [`Number`]( https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number)
      2. [`parseInt(string, radix)`]( https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt )
      3. [`Number.parseFloat(string)`]( https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/parseFloat )

2. `NumberToString`

   看规范，不常用

3. `Boxing`

   > Boxing, otherwise known as wrapping, is the process of placing a primitive type within an object so that the primitive can be used as a reference object. 

   基本类型(primitive type)：`Number`、`String`、`Boolean` 、 `Symbol` 

   ```js
   var x = (function(){ return this; }).call(Symbol("x"))
   console.log(x)
   
   Symbol {Symbol(x)}
       description: "x"
     > __proto__: Symbol
           > constructor: ƒ Symbol()
             description: "x"
           > toString: ƒ toString()
           > valueOf: ƒ valueOf()
           > Symbol(Symbol.toPrimitive): ƒ [Symbol.toPrimitive]()
             Symbol(Symbol.toStringTag): "Symbol"
           > get description: ƒ description()
           > __proto__: Object
           [[PrimitiveValue]]: Symbol(x)
   
   
   console.log(typeof symbolObject); //object
   console.log(symbolObject instanceof Symbol); //true
   console.log(symbolObject.constructor == Symbol); //true
   ```

   通过函数的call方法强制boxing，

   > 所有typeof 返回值为"object" 的对象（如数组）都包含一个内部属性[[Class]]（我们可
   > 以把它看作一个内部的分类，而非传统的面向对象意义上的类）。这个属性无法直接访问，
   > 一般通过Object.prototype.toString(..) 来查看

4. `Unboxing`

   > Unboxing refers to getting the value that is associated to a given object, just through type conversion (either implicit or explicit). 

   ```js
   var o = {
       valueOf : () => {console.log("valueOf"); return {}},
       toString : () => {console.log("toString"); return {}}
   }
   
   o * 2
   
   valueOf
   toString
   Uncaught TypeError: Cannot convert object to primitive value
       at <anonymous>:7:7
   
   
   String(o)
   
   toString
   valueOf
   Uncaught TypeError: Cannot convert object to primitive value
       at String (<anonymous>)
       at <anonymous>:1:1
   ```

   `o * 2`拆箱转换失败，String的拆箱转换优先调用`toString`

   


       o[Symbol.toPrimitive] = () => {console.log("toPrimitive"); return "hello"}
       
       console.log(o + "")	隐式强制类型转换
       // toPrimitive
       // hello
   > 为了将值转换为相应的基本类型值，抽象操作ToPrimitive（参见ES5 规范9.1 节）会首先
   > （通过内部操作DefaultValue，参见ES5 规范8.12.8 节）检查该值是否有valueOf() 方法。
   > 如果有并且返回基本类型值，就使用该值进行强制类型转换。如果没有就使用toString()
   > 的返回值（如果存在）来进行强制类型转换。					--- 4.2.2 You don't know JS



NMD，静态类型真香



相关：

1. 《重学前端》1.1  JavaScript类型：关于类型，有哪些你不知道的细节？ 
2. 《你不知道的JavaScript》（中卷）第一部分：
   - 3.2 封装对象包装(box)
   - 3.3 拆封（Unbox）  4.强制类型转换 
   - 3.1 内部属性 [[class]]
3. [Boxing and Unboxing in TypeScript](https://www.c-sharpcorner.com/UploadFile/c63ec5/boxing-and-unboxing-in-typescript/)
4. [Boxing and Unboxing (C# Programming Guide)](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing )
5. [boxing&unboxing](https://en.wikipedia.org/wiki/Object_type_(object-oriented_programming)#Unboxing)
6. [Symbol.toPrimitive]( https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive )

