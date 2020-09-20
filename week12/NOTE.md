1. 原生节点
```jsx
/**
 * createElement
 *  type:
 *      Node
 *      Class
 *  DOM API
 *     createElement
 *     setAttribute
 *     appendChild
 *      child 类型： Node、TextNode
 * 
 * 
 * 
 *   */
function createElement(type, attributes, ...children) {
    let element;
    if (typeof type === "string") {
        element = document.createElement(type);
    } else 
        element = new type
    
    for (let name in attributes) {  // 对象遍历 for...in 
        element.setAttribute(name, attributes[name])
    }
    for (let child of children) {   // 数组遍历 for...of
        if (typeof child === "string") {
            child = document.createTextNode(child)
        }
        element.appendChild(child)
    }

    return element;
}

// for (let i of [1, 2, 3]) {
//     console.log(i)
// }

let a = <Div id="a">
    <span>hahahhah</span>
    <span>c</span>
    <span>jsj</span>
</Div>

document.body.appendChild(a);
```

2. 自定义节点
### class 暂存死区
要在使用前声明 所以，一定要在<Div>使用前声明

```js
class Div {
    constructor() {
        this.root = document.createElement("div");
    }

    setAttribute(key, value) {
        this.root.setAttribute(key, value);
    }

    appendChild(child) {
        this.root.appendChild(child)
    }

    mountTo(parent) {
        parent.appendChild(this.root)
    }
}
```

进一步抽象
```js
class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type)
    }

    setAttribute(key, value) {
        this.root.setAttribute(key, value);
    }

    appendChild(child) {
        child.mountTo(this.root)
    }

    mountTo(parent) {
        parent.appendChild(this.root)
    }
}
```
这时，不再有appendChild，所有的子节点都通过mountTo放入父节点


### 轮播图组件
#### version1
```jsx
import {Component, createElement} from './framework'

class Carousel extends Component{
    constructor() {
        super();
        this.attributes = Object.create(null)
    }
    setAttribute(name, value) {
        this.attributes[name] = value
    }
    render() {
        this.root = document.createElement("div")
        for (let item of this.attributes.src) {
            let child = document.createElement('img')
            child.src = item
            this.root.appendChild(child)
        }
        return this.root
    }
    mountTo(parent) {
        parent.appendChild(this.render())
    }
}


let imgs = [
    "./img/CityofGuanajuato_ZH-CN7559565626_1920x1080.jpg",
    "./img/MistyVineyard_ZH-CN7642034150_1920x1080.jpg",
    "./img/PirateSails_ZH-CN7821037852_1920x1080.jpg",
    "./img/IcelandicRettir_ZH-CN7738923773_1920x1080.jpg",
    "./img/MontereyPup_ZH-CN7914017418_1920x1080.jpg"
]

let a = <Carousel src={imgs} />

a.mountTo(document.body);
```

#### version2
1. <img>元素是可拖拽的，换用div.style.backgroundImage表示
```css
.carousel {
    width: 500px;
    height: 280px;
    white-space: nowrap;
    overflow: hidden;
}
.carousel>div {
    width: 500px;
    height: 280px;
    background-size: contain;
    display: inline-block;
    transition: ease 0.5s;
}
```
设置正常流排版后，父元素要相应地禁止换行`white-space: nowrap;`。

2. 使用动画将图片移动到可视区域`transform: translateX(distance)`
3. 循环移动 `++current; current = current % children.length;`
4. 问题：一轮播放完毕后，再次从第一个开始播放，而不是循环播放（最后一个播完，全部图片左移，而不是循环左移）
    分析： 视野中始终只有两张图是可视的：当前图片和下一张要播放的图片
    目标：每次轮播要控制两张图片的移动

current保持不变，怎么表示next？
next只是一个相对current的概念：current播放前不显示，current播放后显式的就是next。在逻辑上就是，动画帧播放前next的位置在可视区域外，动画帧播放后next的位置在可视区域内。
当然，在物理意义上，next就是紧挨着current的下一张。

```js
render() {
    this.root = document.createElement("div")
    this.root.classList.add('carousel')
    for (let item of this.attributes.src) {
        let child = document.createElement('div')
        child.style.backgroundImage = `url(${item})`
        this.root.appendChild(child)
    }

    let currentIndex = 0;
    setInterval(() => {
        let children = this.root.children;
        let nextIndex = (currentIndex + 1) % children.length;

        let current = children[currentIndex],
            next = children[nextIndex];

        next.style.transition = "none"  // 关闭动画效果
        next.style.transform = `translateX(${-nextIndex * 100 + 100}%)`

        setTimeout(() => {
            next.style.transition = ""
            current.style.transform = `translateX(${-100 -currentIndex * 100}%)`
            
            next.style.transform = `translateX(${-nextIndex * 100}%)`
            currentIndex = nextIndex;
        }, 16)  // 一帧动画播放完后，恢复next的动画效果(css中设置的)
    }, 3000)

    return this.root
}
```

#### 添加拖拽事件
```js
this.root.addEventListener("mousedown", event => {
    console.log("mousedown")

    let moveover = event => {
        console.log("mouseover")
        event.stopPropagation()
    }

    let up = event => {
        console.log("mouseup")
        this.root.removeEventListener("mousemove", moveover)
        this.root.removeEventListener("mouseup", up)
    }

    this.root.addEventListener("mousemove", moveover)
    this.root.addEventListener("mouseup", up)
})
```
拖动事件时阻止事件代理，或者将事件监听添加到document上
```js
this.root.addEventListener("mousedown", event => {
    console.log("mousedown")

    let moveover = event => {
        console.log("mouseover")
        event.stopPropagation()
    }

    let up = event => {
        console.log("mouseup")
        document.removeEventListener("mousemove", moveover)
        document.removeEventListener("mouseup", up)
    }

    document.addEventListener("mousemove", moveover)
    document.addEventListener("mouseup", up)
})
```

相对于当前鼠标位置的坐标(e.clientX, e.clientY)

实现拖动切换
```js
let position = 0;

this.root.addEventListener("mousedown", event => {
    let children = this.root.children;
    let startX = event.clientX;

    let moveover = event => {
        let x = event.clientX - startX;
        for (let child of children) {
            child.style.transition = "none"
            child.style.transform = `translateX(${- position * 500 + x}px)`
        }
        event.stopPropagation()
    }

    let up = event => {
        let x = event.clientX - startX;
        position = position - Math.round(x / 500);
        for (let child of children) {
            child.style.transition = "";
            child.style.transform = `translateX(${-position * 500}px)`
        }
        this.root.removeEventListener("mousemove", moveover)
        this.root.removeEventListener("mouseup", up)
    }

    this.root.addEventListener("mousemove", moveover)
    this.root.addEventListener("mouseup", up)
})
```
