### 问题：

1. 点击轮播与滑动轮播的集成
2. 移动端touch事件不支持



### 之前用CSS实现动画,如果用JS实现:

控制每一帧(16ms)要做的事情

1. `setInterval(() => {}, 16)`

2. `setTimeout(() => {}, 16)` 

   但是setTimeout只执行一次

   ```js
     let tick = () => {
   
       setTimeout(tick, 16)
   
     }
   ```

3. `requestAnimationFrame`

   ```js
   let tick = () => {
   
       let handler = requestAnimationFrame(tick)
   
       cancelAnimationFrame(handler)
   
     }
   ```

   

   

### Timeline

```js
export class Timeline {
    constructor() {}

    start() {}

    set rate() {}

    get rate() {}

    pause() {}

    resume() {}
}
```

