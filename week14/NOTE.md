1. 将click事件和touch事件抽象为start、move、end三个状态

2. start
    1. tap
        end
    2. pan start
        移动10px
    3. press start
        0.5s

3. 鼠标有左右键之分，触屏touchList有多个touch对象，所以，
    handler、startX、startY、isPan、isTap、isPress应该是根据不同的情况，会有不同的值
    所以这些参数应该是定义了一个被计算的对象 --- context

4. 
    1. event.button / event.buttons
    2. 鼠标的中键和右键顺序相反
    3. 两键同时按下，isTap报错


5. 每个元素添加事件派发的方法

6. 由于不同浏览器的差异，直接计算滑动两点间的距离和速度是不同的，所以改用：
> 一段时间内存储的点来求速度

7. listen -> recognize -> dispatch