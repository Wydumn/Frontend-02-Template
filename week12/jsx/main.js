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
        this.root.classList.add('carousel')
        for (let item of this.attributes.src) {
            let child = document.createElement('div')
            child.style.backgroundImage = `url(${item})`
            this.root.appendChild(child)
        }

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

        /* let currentIndex = 0;
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
        }, 3000) */

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