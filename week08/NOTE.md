### 1. HTML的定义

XML和XGML

**Document Type Definition**：





## prototype-based delegation and event  delegation原型继承与事件委托

>  定义：delegation



### [Event delegation]( https://expertiza.csc.ncsu.edu/index.php/CSC/ECE_517_Fall_2010/ch4_4e_ms )

>  The best example of delegation would be event delegation in JavaScript. Events are the main components of JavaScript. They are triggers to invoke the script. Event delegation works on the principle assumption that if an event is triggered on an element then the same event is triggered on all of the element's ancestors in the tree. Delegation is achieved by attaching a handler to the parent DOM [document object model] element. [4]

>  Consider the DOM model with a window containing a form and a button inside it. The onClick() event associated with the click trigger follows the order below to delegate responsibility:

1. Button.onClick()

2. Form.onClick()

3. Window.onClick()

![](D:\Project\Frontend-02-Template\week08\FormButton.jpg)

> This event propagation can be explicitly stopped using the function - event.stopPropagation(). The advantage achieved here is that a single event handler is used to manage a particular type of event for the entire page. This also consumes less memory. Thus event delegation is a great technique to avoid repetition of the same event assignments for elements within a parent element. This is particularly useful in the DOM model where elements are added dynamically to the page. 

事件派发机制描述了事件如何在DOM树中传播。

事件对象派发到一个事件目标(event target)。派发之前，先要事件对象的传播路径(propagation path)。The propagation path is an ordered list of current event targets.This 	propagation path reflects the hierarchical tree structure of the document.列表的最后一项就是事件目标，前面的项是目标的祖先节点，倒数第二项就是目标的父节点。

> The current event target changes as the eventpropagates from object to object through the various phases of the event flow. The current event target is the value of the `currentTarget` attribute.

传播路径确定后，事件对象就要经过多个事件阶段。

>  In the context of [events](https://www.w3.org/TR/DOM-Level-3-Events/#event), a phase is set of logical traversals from node to node along the DOM tree, from the [Window](https://www.w3.org/TR/DOM-Level-3-Events/#window) to the `Document` object, [root element](https://www.w3.org/TR/DOM-Level-3-Events/#root-element), and down to the [event target](https://www.w3.org/TR/DOM-Level-3-Events/#event-target) ([capture phase](https://www.w3.org/TR/DOM-Level-3-Events/#capture-phase)), at the [event target](https://www.w3.org/TR/DOM-Level-3-Events/#event-target) itself ([target phase](https://www.w3.org/TR/DOM-Level-3-Events/#target-phase)), and back up the same chain ([bubbling phase](https://www.w3.org/TR/DOM-Level-3-Events/#bubble-phase)). 

```
		capture	   | |   / \	bubble
-------------------| |---| |-------------------
|  div2			   | |	 | |				   |
|	---------------| |---| |---------------	   |
|	|div3		   | |	 | |			   |   |
|	|	-----------| |---| |------------   |   |
|	|	|div4	   | |	 | |	   		|  |   |
|	|	|	-------| |---| |-------		|  |   |
|	|	|	|	   \ /   | |	   |	|  |   |
|	|	|	|	spanA    spanB     |	|  |   |
|	|	|	-----------------------	   	|  |   |
|	|	--------------------------------   |   |
|	---------------------------------------    |
-----------------------------------------------
```



>  我们刚提到，实际上点击事件（pointer事件）来自触摸屏或者鼠标，鼠标点击并没有位置信息，但是一般操作系统会根据位移的累积计算出来，跟触摸屏一样，提供一个坐标给浏览器。那么，把这个坐标转换为具体的元素上事件的过程，就是捕获过程了。而冒泡过程，则是符合人类理解逻辑的：当你按电视机开关时，你也按到了电视机。所以我们可以认为，捕获是计算机处理事件的逻辑，而冒泡是人类处理事件的逻辑。
>
> 鼠标位移	--->	坐标	--->	该位置的元素	--->	对应的事件



### Range API

一道面试题对比Node API和Range API。

把一个元素的所有子元素逆序





>  HTML DOM 中的 `HTMLCollection` 是即时更新的（live）；当其所包含的文档结构发生改变时，它会自动更新。 





参考：

1. 《JS高程3》12.4.1 范围



### CSSOM



参考：

1.  https://time.geekbang.org/column/article/86117 
2. 《JS高程3》12.2 样式



### CSSOM View

拖拽：layout





### 浏览器API

 https://developer.mozilla.org/en-US/docs/Web/API 

