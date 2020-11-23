import { Component, createElement } from './framework'

export default class Carousel extends Component{
    constructor() {
        super();
        this.attributes = Object.create(null)
    }
    setAttribute(name, value) {
        this.attributes[name] = value
    }
    render() {
        this.root = document.createElement("div")
        this.root.classList.add('carousel')
        for (let item of this.attributes.src) {
            let child = document.createElement('div')
            child.style.backgroundImage = `url(${item})`
            this.root.appendChild(child)
        }

        let position = 0;
/*
        this.root.addEventListener("mousedown", event => {
            let children = this.root.children;
            let startX = event.clientX;

            let moveover = event =>{
                let x = event.clientX - startX;

                let current = position - ((x - x % 500) / 500);
                for (let offset of [-1, 0, 1]) {
                    let pos = current + offset
                    pos = (pos + children.length) % children.length

                    children[pos].style.transition = 'none';
                    children[pos].style.transform = `tanslateX(${- pos * 500 + offset * 500 + x % 500 })`
                }
                event.stopPropagation()
            }

            let up = event => {
                let x = event.clientX - startX;
                position = position - Math.round(x/500);
                for(let offset of [0,- Math.sign(Math.round(x / 500)- x + 250 * Math.sign(x))]){
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length;
                    children[pos].style.transition = "";
                    children[pos].style.transform = `translateX(${- pos*500 + offset * 500 }px)`
                }
                this.root.removeEventListener("mousemove", moveover)
                this.root.removeEventListener("mouseup", up)
            }

            this.root.addEventListener("mousemove", moveover)
            this.root.addEventListener("mouseup", up)
        })*/

        return this.root
    }
    mountTo(parent) {
        parent.appendChild(this.render())
    }
}