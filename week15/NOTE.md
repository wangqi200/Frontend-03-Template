#### 手势与动画-手势的基本知识
![b3bce0f246bee4a3809c2b531e0baef3.png](evernotecid://2CACCD2F-C8E7-412C-952E-A644B735BEB2/appyinxiangcom/17650854/ENResource/p579)

#### 手势与动画-实现鼠标操作

```
let element = document.documentElement;

element.addEventListener("mousedown", event => {
    start(event)
    let mousemove = event => {
// 监听
        // console.log(event.clientX, event.clientY);
        move(event)
    }

    let  mouseup = event => {
        end(event)
// 移除
    element.removeEventListener("mousemove", mousemove);
    element.removeEventListener("mouseup", mouseup);
    }

    element.addEventListener("mousemove", mousemove);
    element.addEventListener("mouseup", mouseup);

})

element.addEventListener('touchstart', event => {
    // console.log(event.changedTouches)
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        start(touch)
    }

})
element.addEventListener('touchmove', event => {
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        move(touch)
    }
})

element.addEventListener('touchend', event => {
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        end(touch)
    }
})

element.addEventListener('touchcancel', event => {
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        cancel(touch)
    }
})
```
#### 手势与动画-实现手势逻辑
```
let handler;
let startX, startY;
let isPan = false, isTap = true, isPress = false;

// 抽象成一套操作，不需要再去关心是鼠标触发还是touch手势触发的，只维护一套逻辑即可
let start = (point) => {
    // console.log(point.clientX,point.clientY);
    startX = point.clientX;
    startY = point.clientY;
    isTap = true;
    isPan = false;
    isPress = false;
    handler = setTimeout(()=>{
        isTap = false;
        isPan = false;
        isPress = true;
        handler = null;
        console.log('press start')
    },500)

}

let move = (point) => {
    let dx = point.clientX - startX, dy = point.clientY - startY;

    // 开平方比较耗费运算，所以直接用平方进行比较。10px
    if(!isPan && dx **2 + dy **2 > 100){
        isTap = false;
        isPan = true;
        isPress = false;
        console.log("pan start")
        clearTimeout(handler);
    }
    if(isPan){
        console.log(dx,dy)
        console.log("pan")
    }
}

let end = (point) => {
    if(isTap){
        console.log("Tap");
        clearTimeout(handler);
    }
    if(isPan){
        console.log("panned");
    }
    if(isPress){
        console.log("press end");
    }
}

let cancel = (point) => {
    clearTimeout(handler);
}
```

#### 手势与动画-处理鼠标事件
```

let element = document.documentElement;
let isListeningMouse = false;
element.addEventListener("mousedown", event => {
//    根据button 创建context
    let context = Object.create(null);
    contexts.set("mouse" + (1 << event.button), context)
    start(event,context)
    let mousemove = event => {
        // event.buttons   掩码
// 监听
        // console.log(event.clientX, event.clientY);
        let button = 1;
                // event.button 和 event.buttons 的顺序是不完全相同  第二位与第三位刚好是相反的

        while(button <= event.buttons){
            if(button & event.buttons){
                // 为了保持顺序一致，做一些额外的处理
                // order of buttons & button property is not same
                let key ;
                if(button === 2){
                    key = 4;
                }
                else if(button === 4){
                    key = 2;
                }else {
                    key = button;
                }
                let context = contexts.get("mouse" + key)
                move(event,context);
            }
           
            button = button << 1;
        }
    }

    let  mouseup = event => {
        let context = contexts.get("mouse" + (1 << event.button))
        end(event,context)
        contexts.delete("mouse" + (1 << event.button))
// 移除
    if(event.buttons === 0){
        element.removeEventListener("mousemove", mousemove);
        element.removeEventListener("mouseup", mouseup);
        isListeningMouse = false;

    }
    
    }

    if(!isListeningMouse){
        element.addEventListener("mousemove", mousemove);
        element.addEventListener("mouseup", mouseup);
        isListeningMouse = true;
    }
    
})
let contexts = new Map();
element.addEventListener('touchstart', event => {
    // console.log(event.changedTouches)
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        let context = Object.create(null);
        contexts.set(touch.identifier, context)
        start(touch, context)
    }

})
element.addEventListener('touchmove', event => {
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        contexts.get(touch.identifier)
        move(touch,context)
    }
})

element.addEventListener('touchend', event => {
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        contexts.get(touch.identifier)
        end(touch,context)
        contexts.delete(touch.identifier)
    }
})

element.addEventListener('touchcancel', event => {
    for(let touch of event.changedTouches){
        console.log(touch.clientX,touch.clientY);
        contexts.get(touch.identifier)
        cancel(touch,context)
    }
})
// let handler;
// let startX, startY;
// let isPan = false, isTap = true, isPress = false;

// 抽象成一套操作，不需要再去关心是鼠标触发还是touch手势触发的，只维护一套逻辑即可
let start = (point, context) => {
    // console.log(point.clientX,point.clientY);
    context.startX = point.clientX;
    context.startY = point.clientY;
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    context.handler = setTimeout(()=>{
        context.isTap = false;
        context.isPan = false;
        context.isPress = true;
        context.handler = null;
        console.log('press start')
    },500)

}

let move = (point, context) => {
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;

    // 开平方比较耗费运算，所以直接用平方进行比较。10px
    if(!context.isPan && dx **2 + dy **2 > 100){
        context.isTap = false;
        context.isPan = true;
        context.isPress = false;
        console.log("pan start")
        clearTimeout(context.handler);
    }
    if(context.isPan){
        console.log(dx,dy)
        console.log("pan")
    }
}

let end = (point,context) => {
    if(context.isTap){
        console.log("Tap");
        clearTimeout(handler);
    }
    if(context.isPan){
        console.log("panned");
    }
    if(context.isPress){
        console.log("press end");
    }
}

let cancel = (point,context) => {
    clearTimeout(context.handler);
}
```

#### 手势与动画-派发事件
```
function dispatch(type, properties){
    let event = new Event(type);
    for(let name in properties){
        event[name] = properties[name];
    }
    element.dispatchEvent(event);
}
```
注意 for in 和 for of 的区别

#### 手势与动画-实现一个flick事件

```
let end = (point,context) => {
    if(context.isTap){
        console.log("Tap");
        dispatch("tap", {})
        clearTimeout(handler);
    }
    if(context.isPan){
        console.log("panned");
    }
    if(context.isPress){
        console.log("press end");
    }
    context.points = context.points.filter(point=>Date.now() - point.t < 500)
    let d,v;
    if(!context.points.length){
        v = 0;
    }else{
        d = Math.sqrt((point.clientX - context.points[0].x) ** 2  + 
        (point.clientY - context.points[0].y) ** 2);
         v = d / (Date.now() - context.points[0].t);
    }
    if(v >  1.5){
        console.log("flick")
        context.isFlick = true;
    }else{
        context.isFlick = false;
    }
} 
```

#### 手势与动画-封装

