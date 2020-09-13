/**
 * 问题：
 *  let obj = {
        a: { x: 3 },
        b: 2,
    }

    let p = reactive(obj);

    effect(() => {
        console.log(p.a.x);
    })
    这时设置p.a.x = 100;并不会触发effect()。Why???

 * 
 *  */

let callbacks = new Map();
let reactivities = new Map();   // 嵌套的

let usedReactivities = [];

let obj = {
    a: { x: 3 },
    b: 2,
}

let p = reactive(obj);

effect(() => {
    console.log(p.a.x);
})

function effect(callback) {
    // callbacks.push(callback)
    usedReactivities = [];
    callback();
    console.log(usedReactivities);

    for (let reactivity of usedReactivities) {
        if (!callbacks.has(reactivity[0])) {
            callbacks.set(reactivity[0], new Map());
        }
        if (!callbacks.get(reactivity[0]).has(reactivity[1])) {
            callbacks.get(reactivity[0]).set(reactivity[1], [])
        }
        callbacks.get(reactivity[0]).get(reactivity[1]).push(callback);
    }
}

function reactive(object) {
    return new Proxy(object, {
        set(obj, prop, val) {
            obj[prop] = val;
            if (callbacks.get(obj) && callbacks.get(obj).get(prop)) {
                for (let callback of callbacks.get(obj).get(prop)) {
                    callback();
                }
            }
            
            return obj[prop]
        },
        get(obj, prop) {
            usedReactivities.push([obj, prop])
            if (typeof obj[prop] === 'object')
                return reactive(obj[prop]) 

            return obj[prop]
        }
    }) 
}

p.a.x = "jaja";
console.log(p.a.x, p);