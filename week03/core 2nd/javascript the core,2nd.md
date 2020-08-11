[原文]( http://dmitrysoshnikov.com/ecmascript/javascript-the-core-2nd-edition/ )



### Object

我们先来讨论ECMAScript的基础 --- 对象的概念。

> **Def.1：Object:**一个对象是一组属性的集合，有唯一的原型对象。原型可能是一个对象或者`null`值

先来看一个简单的例子。一个对象的原型由内部属性`[[Prototype]]`引用，coder层面看到的就是`__proto__`属性。

![1595643538176](C:\Users\97170\AppData\Roaming\Typora\typora-user-images\1595643538176.png)

有两个显式的属性和一个隐式的引用`point`原型对象的`__proto__`属性。

![](D:\Project\Frontend-02-Template\week03\core 2nd\js-object.png)

通过动态分派(dynamic dispatch)机制使用原型对象来实现继承。用原型链的概念来详细分析该机制。



### Prototype

每一个对象在创建时都自带原型。若没有显式地设置原型，就把默认原型作为继承对象。

> **Def. 2：Prototype:**原型也是一个对象 --- 委派对象(delegation object)，用来实现基于原型的继承。

原型可以通过`__proto__`属性或者`Object.create`方法来显式地创建：

```js
let point = {
    x: 10,
    y: 20,
}

let point3D = {
    z: 30,
    __proto__: point,
}

console.log(
    point3D.x,	// 10
    point3D.y,  // 20
    point3D.z   // 30
)
```

​	**注：**默认地，对象接收`Object.prototype`作为继承对象

一个对象可以作为另一个对象的原型，作为原型对象又可以有自己的原型。如果一个原型有一个非空(non-null)的原型引用，and so on,称为原型链。

> **Def. 3：Prototype chain：**一个原型链是有限个一连串的对象，用来实现继承和属性共享。

![](D:\Project\Frontend-02-Template\week03\core 2nd\prototype-chain.png)

规则挺简单的：若在自身属性中未找到目标属性，就到原型中找；未找到，到原型的原型中找，etc.直到找到为止或找至整个原型链。

这个机制称为动态分派或委托。

> **Def. 4：Delegation：**在原型链中查找属性的机制. 该过程发生在运行时，因此也称为**动态分派**(dynamic dispatch)

​	静态分派发生在编译时。

若在原型链中未找到目标属性，最终返回`undefined`：

```js
let empty = {}

console.log(
    
    // function, from default prototype
    empty.toString,
    
    // undefined
    empty.x
)
ƒ toString() { [native code] } 
undefined
```

如上代码，一个初始对象不可能为空，会从`Object.prototype`继承一些属性。为了创建一个没有原型的字典对象，要显式地设置原型为`null`：

```js
// 没有继承任何对象
let dict = Object.create(null)

console.log(dict.toString)	// undefined
```

动态分派机制通过提供改变委派对象的能力来允许继承链的完全可变：

```js
let protoA = {x: 10}
let protoB = {x: 20}

// same as `let objectC = {__proto__: protoA};`
let objectC = Object.create(protoA)
console.log(objectC.x)	// 10

// Change the delegate
Object.setPrototypeOf(objectC, protoB)
console.log(objectC.x)	// 20
```

​	**注：**即使`__proto__`属性仍然是标准，并且解释时更方便，但是实际工作中，使用操作原型的API方法更好，比如：`object.create`，`Object.setPrototypeOf`（与反射模块上的类似）.

在`Object.prototype`的例子中，我们看见同一个原型可以被多个对象共享。在这一原理上，ECMAScript实现了基于类(class-based)的继承。我们来看看这个例子 --- JS "class"抽象的底层原理。

### Class

多个对象共享同样的初始状态和行为时，他们就形成了一个classification.

> Def. 5：Class：类是一个形式化的抽象集，指定了对象的初始状态和行为。

当我们需要多个对象继承自同一个原型时，我们就需要创建该原型，使得新创建的对象显式地继承它。

```js
let letter = {
    getNumber() {
        return this.number
    }
}

let a = {number: 1, __proto__: letter};
let b = {number: 2, __proto__: letter}
// ...
let z = {number: 26, __proto__: letter}

console.log(
	a.getNumber(),	// 1
    b.getNumber(),	// 2
    z.getNumber()	// 26
)
```

![](D:\Project\Frontend-02-Template\week03\core 2nd\shared-prototype.png)

很麻烦，类抽象就是为了达到这个目的 --- 作为一个语法糖（以更好的语法形式表达同样的语义），它使得以便捷的模式创建多个这样的对象。



​	**注：**在ECMAScript中，基于类的继承(class-based inheritance)是在基于原型的委托(prototype-based delegation)之上实现的。



​	**注：**一个"类"只是理论上的抽象。具体的，它可以在JAVA、C++中以静态分派(static dispatch)实现或在JavaScript、Python、Ruby等中以动态分派(dispatch delegation)实现。



js中，"类"表示为a "constructor function + prototype" pair。因此，一个构造函数创建了对象，并自动为新创建的实例对象设置了原型，原型存在`<ConstructorFunction>.prototype`属性中。

> **Def. 6：Constructor：**一个构造函数是一个用来创建实例并自动设置原型的函数。



可以显式的使用构造函数。此外，在引入类抽象之前，JS开发者没有更好的选择（现在网上还能找到很多这样的遗留代码）。

```js
function Letter(number) {
    this.number = number;
}

Letter.prototype.getNumber = function() {
    return this.number
}

let a = new Letter(1)
let b = new Letter(2)
// ...
let z = new Letter(26)

console.log(
	a.getNumber(),	// 1
    b.getNumber(),	// 2
    z.getNumber()	// 26
)
```

创建一个单层构造函数很容易，但从父类继承的模式需要更多的样例。作为实现细节，这个样板现在已经隐藏了，这就是当我们在JavaScript中创建一个类时，底层的实现细节。

​	**注：**构造函数只是基于类继承的实现细节。



我们来看一下对象及他们所属类之间的关系：

![](D:\Project\Frontend-02-Template\week03\core 2nd\js-constructor.png)

上图显式每一个对象都有一个相关联的原型。即使是一个构造函数(类)`Letter`，也有自己的原型`Function.prototype`。注意，`Letter.prototype`是Letter实例`a`，`b`，`z`的原型。

​	**注：**任一对象的实际原型是`__proto__`引用。构造函数上显式的`prototype`属性只是对它实例原型的引用；从实例角度看，还是`__proto__`引用的对象。



你可以在[ES3. 7.1 OOP: The general theory](http://dmitrysoshnikov.com/ecmascript/chapter-7-1-oop-general-theory)中找到关于一般OOP概念的详细讨论（包括基于类的、基于原型的详细讨论）。

现在，当我们理解了ECMAScript对象的基本关系后，我们来深入JS的运行时系统。我们将看到，几乎所有的东西都可以由一个对象来表示。



### Execution context

为了执行JS代码，追踪它的runtime evaluation，ECMAScript规范定义了执行上下文(execution contexts)的概念。逻辑上，执行上下文是使用栈进行维护的，栈与调用栈(call-stack)的一般概念相对应。

> Def. 7：Execution context：执行上下文是规范定义的工具（sepecification device），用于追踪代码的运行时求值（runtime evaluation）。

有几种ECMAScript代码类型：全局代码（global code），函数代码（function code），`eval` code，和模块代码（module code）；每一种代码都是在执行上下文中求值的。不同的代码类型及其合适的对象可能影响执行上下文的结构：比如，generator函数将其generator对象保存在context中。

考虑如下递归函数调用



```js
function recursive(flag) {

    // Exit condition.
    if (flag === 2) {
        return;
    }
    
    // Call recursively.
    recursive(++flag);
}

// Go.
recursive(0);
```



当一个函数被调用时，就创建一个新的执行上下文，并入栈，这时它就是一个活动执行上下文（active execution context）；函数返回时，它的context同时出栈。

调用另一个context的context称为caller，相应地，被调的context称为callee。上例中，`recursive`函数既是caller又是callee。

> Def. 8：Execution context stack：执行上下文栈是一个用来保存控制流和执行顺序的LIFO结构。

对于上面的例子，有如下出栈入栈变化：





如图，全局上下文永远在栈底，它是在任何其他上下文执行之前创建的。

你可以在[对应章节](http://dmitrysoshnikov.com/ecmascript/chapter-1-execution-contexts/)找到关于执行上下文的更多细节。

一般来说，上下文的代码是从上到下依次执行的。然而有些对象会打破栈的LIFO顺序，比如之前提到的 generators.一个generator函数可以挂起（suspend）它的running context，并在执行完毕之前从栈中移除。generator再次激活后，它的context （resumed），再次入栈：

```js
function *gen() {
    yield 1;
    return 2;
}

let g = gen();

console.log(
	g.next().value,	// 1
    g.next().value, // 2
);
```



这里的`yield`语句返回值给caller并弹出context。第二次调用`next`时，同一个context恢复，入栈。这样的上下文可能会超出创建它的caller的生命周期，所以打破了LIFO结构。

​	**注意：**你可以在[这个文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Iterators_and_Generators)中阅读更多关于generators和iterators的内容。

现在我们将讨论执行上下文中的重要组成部分。特别是，我们应该看看ECMAScript运行时是如何管理变量存储和嵌套代码块创建的作用域的。这就是词法环境（lexical environment）的一般概念，它在JS中用于存储数据，并通过闭包机制解决"[Funarg problem](https://en.wikipedia.org/wiki/Funarg_problem)".



### Environment

每一个执行上下文都有一个相关联的词法环境。

> Def. 9：Lexical environment：词法环境是一个用来定义上下文中标识符及其值之间的关联的结构。每个环境都可以引用一个可选的父环境。

所以环境是作用域中定义的变量、函数和类的存储。

​	**注意：**你可以在[Essentials of Interpretation](https://www.youtube.com/playlist?list=PLGNbPb3dQJ_4WT_m3aI3T2LRf2R_FKM2k)课程对应的课节[appropriate lecture](https://www.youtube.com/watch?v=KRpYZBUkUsk)找到环境实现的例子。

技术上说，环境是一对环境记录（将标识符映射到值的实际存储表）和对父环境的引用（可以为null）组成。

看代码：

```js
let x = 10;
let y = 20;

function foo(z) {
    let x = 100;
    return x + y + z;
}

foo(30);	// 150
```

全局上下文的环境结构，`foo`函数的上下文如下：

















