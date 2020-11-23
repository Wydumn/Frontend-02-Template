import {Component, createElement} from './framework'
import Carousel from './Carousel'
import {Animation, Timeline} from './animation'



let imgs = [
    "./img/CityofGuanajuato_ZH-CN7559565626_1920x1080.jpg",
    "./img/MistyVineyard_ZH-CN7642034150_1920x1080.jpg",
    "./img/PirateSails_ZH-CN7821037852_1920x1080.jpg",
    "./img/IcelandicRettir_ZH-CN7738923773_1920x1080.jpg",
    "./img/MontereyPup_ZH-CN7914017418_1920x1080.jpg"
]

let a = <Carousel src={imgs} />
a.mountTo(document.body);

let tl = new Timeline();
window.tl = tl;
window.animation = new Animation({ set a(v) { console.log(v) }}, "a", 0, 100, 1000, null)
// tl.add(new Animation({ set a(v) { console.log(a) }}, "a", 0, 100, 1000, null));
tl.start();

