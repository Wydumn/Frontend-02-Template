import {Animation, Timeline} from './animation.js'
import { ease } from './ease.js'

let tl = new Timeline();

tl.start();

tl.add(new Animation(document.querySelector("#el1").style, "transform", 0, 500, 2000, 0, ease, v => `translateX(${v}px)`)) 
document.querySelector("#el2").style.transition = 'transform 2s ease'
document.querySelector("#el2").style.transform = 'translateX(500px)'

document.querySelector("#pause-btn").addEventListener("click", () => tl.pause())
document.querySelector("#resume-btn").addEventListener("click", () => tl.resume())