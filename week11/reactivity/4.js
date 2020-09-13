/**
 * 现在，想要自动执行track、trigger
 *  也就是说：
 *      1. 在访问(GET)依赖项时，执行track
 *      2. 在改变(SET)reactivity对象时，执行triggr
 *  
 * */

/**
 * 访问对象属性的三种方式
 *  1. .
 *  2. []
 *  3. Proxy
 * 
 *  */

// let product = { price: 5, quantity: 2 }

// console.log(product.quantity)   // 1
// console.log(product['quantity'])  // 2
// console.log(Reflect.get(product, 'quantity'));  // 3
 
// Proxy: A placeholder for another object, which by default delegates to the object.

/* version 1
let proxiedProduct = new Proxy(product, {})
console.log(proxiedProduct.quantity) */

// A Proxy handler is a trap. 
// A trap allows us to intercept fundamental operations

/* version 2
let proxiedProduct = new Proxy(product, {
    get() {
        console.log('Get was called')
        return 'Not the value'
    }
})

console.log(proxiedProduct.quantity);   
// Get was called
// Not the value
 */

/* version 3
    let proxiedProduct = new Proxy(product, {
    get(target, key) {
        console.log('Get was called with key = ' + key)
        return target[key]
    }
})
 */

/* 
let proxiedProduct = new Proxy(product, {
    get(target, key, receiver) {    // receiver 指定原型链上某一对象
        console.log('Get was called with key = ' + key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        console.log('Set was called with key = ' + key)
        return Reflect.set(target, key, value, receiver)
    }
})

proxiedProduct.quantity = 4;
console.log(proxiedProduct.quantity) */

function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            console.log('Get was called with key = ' + key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            console.log('Set was called with key = ' + key)
            return Reflect.set(target, key, value, receiver)
        }        
    }

    return new Proxy(target, handler)
}

let product = reactive({ price: 5, quantity: 6 })
product.quantity = 200;
console.log(product.quantity)

