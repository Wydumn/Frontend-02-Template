export function createElement(type, attributes, ...children) {
    let element;
    if (typeof type === "string") {
        element = new ElementWrapper(type);
    } else 
        element = new type;
    
    for (let name in attributes) {  // 对象遍历 for...in 
        element.setAttribute(name, attributes[name])
    }
    for (let child of children) {   // 数组遍历 for...of
        if (typeof child === "string") {
            child = new TextWrapper(child)
        }
        element.appendChild(child)
    }

    return element;
}

export class Component {
    constructor(type) {

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

class TextWrapper extends Component {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        this.root = document.createElement(type)
    }
}