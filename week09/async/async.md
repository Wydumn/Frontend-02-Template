

>  **Giving your number to a restaurant is just like giving a callback function to a third party service. You \*expect\* the restaurant to text you when a table opens up, just like you \*expect\* the third party service to invoke your function when and how they said they would.**  

Once your number or callback function is in their hands though, you’ve lost all control. This is **Inversion of Control**.

 When you write a callback, you’re assuming that the program you’re giving the callback to is responsible and will call it when (and only when) it’s supposed to. You’re essentially inverting the control of your program over to another program. 



#### Why Promise?

allow you to keep all the control.

 If you’ve never used one before, the idea is simple. Instead of taking your name or number, they give you this device. When the device starts buzzing and glowing, your table is ready. You can still do whatever you’d like as you’re waiting for your table to open up, but now you don’t have to give up anything. In fact, it’s the exact opposite. **They** have to give **you** something. There is no inversion of control. 

 **If giving the restaurant your number is like giving them a callback function, receiving the little buzzy thing is like receiving what’s called a “Promise”.** 



```js
// async generator 配合 for await of ????????????????
async function* counter() {
    let i = 0;
    while(true) {
        await sleep(1000);
        yield i++;
    }
}

(async function() {
    for await(let v of counter()) {
        console.log(v)
    }
})();
```



