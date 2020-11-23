[原文]( http://dmitrysoshnikov.com/ecmascript/javascript-the-core-2nd-edition/ )



### Object

我们先来讨论ECMAScript的基础 --- 对象的概念。

> **Def.1：Object:**一个对象是一组属性的集合，有唯一的原型对象。原型可能是一个对象或者`null`值

先来看一个简单的例子。一个对象的原型由内部属性`[[Prototype]]`引用，coder层面看到的就是`__proto__`属性。

```js
let point = {
    x: 10,
    y: 20,
}
```

有两个显式的属性和一个隐式的引用`point`原型对象的`__proto__`属性。

![](C:\project\private\Frontend-02-Template\week03\core 2nd\js-object.png)

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

![](C:\project\private\Frontend-02-Template\week03\core 2nd\prototype-chain.png)

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

![](C:\project\private\Frontend-02-Template\week03\core 2nd\shared-prototype.png)

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

![](C:\project\private\Frontend-02-Template\week03\core 2nd\js-constructor.png)

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

![An execution context stack*](C:\project\private\Frontend-02-Template\week03\core 2nd\execution-stack.png)



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

![an environment chain](C:\project\private\Frontend-02-Template\week03\core 2nd\environment-chain.png)



这和之前的原型链很像。并且标识符解析的规则也 相似：如果在当前环境中未找到变量，就到父环境中找，还找不到就到父环境的父环境中。。。直到遍历整个（环境链）environment chain.



> Def.10：标识符解析：解析环境链中的变量（绑定）的过程。 无法解析的绑定导致ReferenceError。

这就解释了为什么变量`x`是100而不是10 --- `foo`直接在自己的环境中找到`x`；为什么可以访问到变量`z` --- 它就存在activation environment中；为什么可以访问到变量`y` --- 在父环境中找到它。

和原型链相似，同一个父环境可以被多个子环境共享：比如，两个全局函数共享同一个全局环境。

​	**Note:** you can get detailed information about lexical environment in [this article](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-2-lexical-environments-ecmascript-implementation/).环境记录（Environment records） 分为不同类型：对象(object)环境记录和声明(declarative)环境记录。声明环境记录又分为函数(function)环境记录和模块(module)环境记录。每个特定类型的记录有自己独有的属性。当然，标识符解析的机制都是一样的，不依赖于记录类型。

一个对象环境记录可以是全局环境记录。这样的记录也有关联的绑定对象，绑定对象存储一些记录中的属性，而不是其他的。绑定对象也可以由`this`值提供。

```js
// Legacy variables using `var`
var x = 10;

// Modern variables using `let`
let y = 20;

// Both are added to the environment record:
console.log(
	x,	// 10
    y,	// 20
)
// But only `x` is added to the  "binding object".
// The binding object of the global environment is the global object, and equals to `this`

console.log(
	this.x,	// 10
    this.y,	// undefined
)
// Binding object can store a name which is not added to the environment record, since it's not a valid identifier:

this[`not valid ID`] = 30;

console.log(
	this['not valid ID'],	// 30
)
```

下图绘出关系

![A binding object](C:\project\private\Frontend-02-Template\week03\core 2nd\env-binding-object.png)

注意，绑定对象的存在是为了涵盖旧式构造（`var`声明和`with`语句），这种构造也将其对象作为绑定对象提供。这些是环境由简单对象表示的历史原因。现在的环境模型经过了优化，不能再作为属性访问到了。

我们已经看到了环境如何通过父链接关联，现在来看一看环境如何在创建它的上下文之外存在。这也是我们将要讨论的闭包机制的基础。



### Closure

函数在ECMA中是一等公民。这个概念也是函数式编程的基础，在JavaScript中也支持。

> Def. 11: 一等函数：可以作为一般数据的函数：存在变量中，作为参数传入，作为函数的返回值

与一等函数相关的是所谓**Funarg problem**，或函数参数问题。当函数不得不处理自由变量（free variables）时，就会出现这个问题。

> Def. 12：自由变量（Free variable）：函数中既不是参数，也不是局部变量的变量

我们来看一看Funarg 问题，看看它在ECMA中是如何解决的。

考虑如下代码

```js
let x = 10;

function foo() {
    console.log(x);
}

function bar(funArg) {
    let x = 20;
    funArg();	// 10
}

// Pass `foo` as an argument to `bar`
bar(foo);
```

对于函数`foo`，变量`x`就是自由的。当函数`foo`被激活（通过`funArg`参数）后，应该到哪里查找`x`的绑定？从创建函数的外层作用域，从主调函数的作用域，还是函数被调用的地方？主调函数`bar`中也有`x`的绑定 -- 20.

上面的例子是**downwards funarg problem**，例如：确定一个绑定的正确环境时的歧义：是创建时的环境还是调用时的环境？

这通过使用静态作用域（static scope）来解决，也就是创建时作用域。

> Def. 13：静态作用域（Static scope）：如果只在源代码中就可以确定绑定在哪个环境中解析的绑定，那么该语言就实现了静态作用域

静态作用域有时也称为词法作用域，这也是词法环境这一名称的由来。

技术上，静态环境是通过捕获函数创建时的环境来实现的。

**Note:** you can read about *static* and *dynamic* scopes in [this article](https://codeburst.io/js-scope-static-dynamic-and-runtime-augmented-5abfee6223fe).

在我们的例子中，函数`foo`捕获到的环境是global environment：

![](C:\project\private\Frontend-02-Template\week03\core 2nd\closure.png)

可以看到一个环境引用了一个函数，该函数又引用回了这个环境。

> Def. 14：Closure（闭包）：闭包是捕获了定义该函数的环境的函数。这个环境用来做标识符解析。

**Note:**  一个函数在新的激活环境中调用，这个环境存储了局部变量和参数。激活环境的父环境设置为该函数的闭合环境，从而有了词法作用域的语义。

Funarg问题的另一个子类型是**upwards funarg problem**.这里唯一的区别是捕获的环境比创建它的上下文存在的更久。

看如下例子：

```js
function foo() {
    let x = 10;
    
    // 闭包，捕获foo的环境
    function bar() {
        return x;
    }
    
    // Upward funarg
    return bar;
}

let x = 20;

// 调用foo来返回bar闭包
let bar = foo();

bar();	// 10，不是 20
```

同样，技术上，它与捕获定义环境的机制没什么不同。这种情况下，如果没有闭包，`foo`的激活环境将被销毁。但是我们捕获了它，所以它不能被释放掉，得以保留，来支持静态作用域语义。

对闭包的理解经常不完整：开发者认为闭包只是就**upward funarg**问题而存在的，但实际上它更有意义。如你所见，downwards 和 upwards funarg问题的技术机制是完全相同的 --- 就是静态作用域。

如我们之前提到的，与原型相似，同样的父环境可以被多个闭包共享。这就可以访问和修改共享的数据：

```js
function createCounter() {
    let count = 0;
    
    return {
        increment() { count++; return count; },
        decrement() { count--; return count; },
    }
}

let counter = createCounter();

console.log(
	counter.increment(),
    counter.decrement(),
    counter.increment(),
)
```

因为`increment`和`decrement`两个闭包都是在包含`count`变量的作用域中创建的，所以它们共享同一父作用域。也就是说，捕获总是通过引用进行 --- 意味着对整个父环境的引用被存储了下来。

如下图：

![](C:\project\private\Frontend-02-Template\week03\core 2nd\shared-environment.png)

有些语言可能根据值来捕获，将捕获到的变量拷贝一份，且不允许在父级作用域中改变它。但是在JS中，再说一遍，它总是对父级作用域的引用。

**Note:** implementations may optimize this step, and do not capture the whole environment. Capturing *only used* free-variables, they though still maintain invariant of mutable data in parent scopes.JS引擎的实现可能会优化这个步骤，不捕获整个环境。虽然只捕获要用到的自由变量，但仍然在父级作用域维护可变数据的不变量。

你可以在[适当的章节](http://dmitrysoshnikov.com/ecmascript/chapter-6-closures/)中找到有关闭包和Funarg问题的详细讨论。

所以，所有的标识符都是静态作用域的。但是在ECMAScript中有一个值是动态作用域的，就是`this`。



### This

`this`值是一个特殊的对象，动态、隐式地传递给上下文的代码。我们可以作为一个隐式的额外形参，可以访问但不能修改。

`this`值的用途就是对多个对象中执行同样的代码。

> Def. 15：This：从执行上下文获取的一个隐式的上下文对象 --- 用来对多个对象应用同样的代码。

主要的使用场景是基于类的OOP。一个示例中存在一个实例的方法（定义在原型上），该方法可以在这个类的实例中共享。

```js
class Point {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    
    getX() {
        return this._x;
    }
    
    getY() {
        return this._y;
    }
}

let p1 = new Point(1, 2);
let p2 = new Point(3, 4);

// 两个实例中可以访问到`getX`和`getY`方法(他们作为`this`传入)

console.log(
	p1.getX(),	// 1
    p2.getX(),	// 3
)
```

当`getX`方法激活后，创建一个新的环境来存储局部变量和参数。另外，函数环境记录（function environment record）得到了传递过来的`[[ThisValue]]`，这个值根据函数如何调用来动态的绑定：当调用`p1`时，`this`值就是`p1`；调用`p2`时，`this`值就是`p2`。

`this`的另一个用处就是通用的接口函数（*generic interface functions*），在mixins或traits中使用。

下面的例子中，`Movable`接口包含了通用函数`move`，`_x`和`_y`留给mixin的用户去实现。

```js
// 通用Movable接口（mixin）
let Movable = {
    /**
     *  这个函数是通用的，可以与提供`_x`和`_y`属性的任何对象一起使用，无论该对象的类是什么
     */
    move(x, y) {
        this._x = x;
        this._y = y;
    },
};

let p1 = new Point(1, 2);

// 让`p1`movable
Object.assign(p1, Movable);

// 可以访问`move`方法
p1.move(100, 200);

console.log(p1.getX());	// 100
```

作为替代方案，也可以在原型上应用mixin，而不是像上面的实例那样在每个实例上应用。

为了展示`this`值的动态性，考虑下面示例，作为一个练习留给读者：

```js
function foo() {
    return this;
}

let bar = {
    foo,
    baz() {
        return this;
    },
};

// `foo`
console.log(
	foo(),			// global or undefined
    bar.foo(),		// bar
    (bar.foo)(),	// bar
    
    (bar.foo = bar.foo)(),	// global
);

// `bar.baz`
console.log(bar.baz());	// bar

let savedBaz = bar.baz;
console.log(savedBaz());	// global
```

因为只看`foo`函数的代码分辨不出`foo`在特定调用中`this`值是什么，我们称`this`值是动态作用域的。

**Note:** you can get a detailed explanation how `this` value is determined, and why the code from above works the way it does, in the [appropriate chapter](http://dmitrysoshnikov.com/ecmascript/chapter-3-this/).

箭头函数的`this`值是特殊的：`this`值是词法的（静态的）而不是动态的。即，箭头函数的函数环境记录不提供`this`值，它的值从父环境取。

```js
var x = 10;

let foo = {
    x: 20,
    
    // 动态`this`
    bar() {
        return this.x;
    },
    
    // 词法`this`
    baz: () => this.x,
    
    qux() {
        // 调用时的词法this
        let arrow = () => this.x;
        
        return arrow();
    };
};

console.log(
	foo.bar(),	// 20, from `foo`
    foo.baz(),	// 10, from global
    foo.qux(),	// 20, from `foo` and arrow
)
```

就像我们说过的，在全局上下文中`this`值就是全局对象（全局环境记录的绑定对象）。之前的规范只有一个全局对象，当前版本的规范可以有多个全局对象，它们是代码域(*code realms*)的一部分。我们来讨论一下这个部分。



### Realm

在求之前，所有的ECMAScript代码必须与一个域（*realm*）关联。技术上一个realm只为一个上下文提供一个全局环境。

> Def. 16：域(Realm)：一个代码域就是封装了一个单独的全局环境的对象。

当执行上下文创建时，它就关联了一个为上下文提供全局环境的特定代码域，这个关联保持不变。

**Note:** 域在浏览器环境的直接等效就是`iframe`元素，该元素恰好提供了一个自定义的全局环境；在Node.js中域接近于[vm模块](https://nodejs.org/api/vm.html)的沙箱。



当前版本的规范没有提供显式创建域的能力，但是可以通过隐式创建。不过已经有提案提议暴露这个API给用户。

逻辑上，栈中的每个上下文总是关联一个域：

![A context and realm association](C:\project\private\Frontend-02-Template\week03\core 2nd\context-realm.png)

我们来看一下单独的域示例：

```js
const vm = require('vm');

const realm1 = vm.createContext({x: 10, console})

const realm2 = vm.createContext({x: 20, console})

const code = `console.log(x)`
```

现在我们更接近ECMAScript运行时的全局（*bigger picture*）了。但我们仍然需要看一下代码的入口和初始化过程。这由jobs和jobs队列来管理。



### Job

有些操作可以延迟，等到执行上下文栈有可用的位置时再执行。

> Def. 17：Job：一个job是一个抽象操作，当目前没有其他ECMAScript计算正在进行时初始化一个ECMAScript计算。

Jobs入队到**job队列**，在当前版本的规范中，有两个job队列：**ScriptJobs**和**PromiseJobs**.

*ScriptJobs*队列中的*初始job*是程序的主入口 -- 加载初始脚本并求值：创建一个域(realm)，创建一个全局上下文并和这个域关联，全局上下文入栈，全局代码就开始执行。

注意，*ScriptJobs*队列管理脚本和模块这两种源文件。

这个上下文可以执行其他上下文，或者入队其他*jobs*。另一个可以生成job并入队的例子是*promise*。

当没有正在执行的执行上下文且执行上下文栈为空时，ECMAScript实现从job队列中移除掉第一个*pending job*，创建一个执行上下文并开始执行。

**Note:** the job queues are usually handled by the abstraction known as the **“Event loop”**. ECMAScript standard doesn’t specify the event loop, leaving it up to implementations, however you can find an educational example — [here](https://gist.github.com/DmitrySoshnikov/26e54990e7df8c3ae7e6e149c87883e4).



例子：

```js
// 入队一个promise到PromiseJobs队列中
new Promise(resolve => setTimeout(() => resolve(10), 0))
	.then(value => console.log(value));

// This log is executed earlier, since it's still a
// running context, and job cannot start executing first
console.log(20)

// Output：20, 10
```



**Note:** you can read more about promises in [this documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).



**异步函数**可以等待promises，它们可以入队到promise jobs：

```js
async function later() {
    return await Promise.resolve(10);
}

(async () => {
    let data = await later();
    console.log(data);	// 10
})();

// 	Also happens earlier, since async execution
//	is queued on the PromiseJobs queue.
console.log(20);

// Output：20, 10
```

**Note:** read more about async functions in [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

我们非常接近当前JS Universe的final picture。现在，我们将看到我们讨论过的所有这些部分的主要所有者，即*Agents*。



### Agent

ECMAScript使用Agent模式实现并发和并行。Agent模式非常接近于[Actor 模式](https://en.wikipedia.org/wiki/Actor_model) -- 一个带有消息传递风格的通信的轻量级进程。

> Def. 18：Agent：一个agent是封装了执行上下文栈，一组job队列和代码域（*code realm*）的抽象。

依赖于该agent的实现可以在同一个线程运行，或者在一个单独的线程运行。Agent概念的一个例子就是浏览器的`Worker`agent。

agents之间状态相互是独立的，可以发送消息来通信。有些数据可以在agents之间共享，比如`SharedArrayBuffer`。Agents也可以合并为agent集群。

在下面的例子中，`index.html`调用了`agent-smith.js`worker，传递共享的内存块：

```js
// In the `index.html`:

// Shared data between this agent, and another worker.
let sharedHeap = new SharedArrayBuffer(16);

// Our view of the data.
let heapArray = new Int32Array(sharedHeap);

// Create a new agent (worker).
let agentSmith = new Worker('agent-smith.js');

agentSmith.onmessage = (message) => {
    // Agent sends the index of the data it modified.
    let modifiedIndex = message.data;
    
    // Check the data is modified:
    console.log(heapArray[modifiedIndex]); // 100
};

// Send the shared data to the agent.
agentSmith.postMessage(sharedHeap);
```

worker代码：

```js
// agent-smith.js

/**
 *	Receive shared array buffer in this worker.
 */

onmessage = (message) => {
    // Worker's view of the shared data.
    let heapArray = new Int32Array(message.data);
    
    let indexToModify = 1;
    heapArray[indexToModify] = 100;
    
    // Send the index as a message back.
    postMessage(indexToModify)
}
```

可以在这个[gist](https://gist.github.com/DmitrySoshnikov/b75a2dbcdb60b18fd9f05b595135dc82)中看完整代码。

（注意，如果你在本地运行这个代码，在Firefox中，因为Chrome由于安全问题不允许从本地文件加载web worker）

下面是ECMAScript的运行时：

![ECMAScript runtime](C:\project\private\Frontend-02-Template\week03\core 2nd\agents-1.png)

that's what happens under the hood of the ECMAScript engine!

现在我们就结束了。这就是在概述文章中能讲到的大多信息了。就像之前提到的，JS代码可以分组为模块，对象的属性可以为`Proxy`对象追踪等，不同的JavaScript语言文档中有更多的用户层的细节。