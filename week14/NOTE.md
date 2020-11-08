学习笔记
## 动画与手势

### 一、初步建立动画和时间线
帧的概念
最基础的动画的能力就是每帧我们去执行一个什么样的事件。
16毫秒的常识，60帧。
requestAnimationFrame 是目前最好的方式，它是由系统决定动画回调函数执行的时机，其他方式都是异步队列，执行时机会受到主线程的影响

```
// let tick = ()=>{
//     setTimeout(tick, 16)
// }

// let tick = ()=>{
//     requestAnimationFrame(tick)
// }


// let tick = ()=>{
//     let handler = requestAnimationFrame(tick);
//     cancelAnimationFrame(handler)
    
// }
```
### 二、设计时间线
时间线是动画系统的一部分，控制动画执行的过程和状态
创建一个TimeLine的类
提供以下方法
start()
pause()
resume()
reset()
* 使用Symbol的好处是避免外界访问内部方法，相当于实现私有化一种小技巧
### 三、给动画添加暂停和重启功能
暂停使用cancelAnimationFrame可以取消一个requestAnimationFrame
继续需要记录暂停动画的时间并且计算出暂停了多少时间，再次启动动画时候减去改时间差
### 四、完善动画的其他功能
### 五、对时间线进行状态管理



本周主要内容是JS动画，最基础的动画的能力就是每帧我们去执行一个什么样的事件。定义了两个类Timeline和Animation。

Timeline类用户控制动画，通过requestAnimationFrame定义tick方法，在每一帧到达的时候，遍历所有Animation对象，判断当前时间是否在Animation所允许的时间范围内（需要减去暂停时间和延迟时间），在的话就触发动画修改属性值。 这里虽然使用了Symbol定义了tick方法，但是还是可以通过Object.getOwnPropertySymbols(new Timeline)获取到。 Timeline具有start pause resume reset add功能，以及三个状态Inited started paused以保证一定的健壮性。

