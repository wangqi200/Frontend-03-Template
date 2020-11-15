
let element = document.documentElement;


// let handler;
// let startX, startY;
// let isPan = false, isTap = true, isPress = false;
export class Dispatcher{
    constructor(element){
this.element = element;
    }
    dispatch(type, properties){
        let event = new Event(type);
        for(let name in properties){
            event[name] = properties[name];
        }
        element.dispatchEvent(event);
    }
}
// 抽象成一套操作，不需要再去关心是鼠标触发还是touch手势触发的，只维护一套逻辑即可
export function dispatch(type, properties){
    let event = new Event(type);
    for(let name in properties){
        event[name] = properties[name];
    }
    element.dispatchEvent(event);
}

// listen =》recognize =》dispatch

// new Listener(new Recognizer(dispatch))
export class Listener {
    constructor(element, recognizer){
        let contexts = new Map();

        let isListeningMouse = false;
        element.addEventListener("mousedown", event => {
        //    根据button 创建context
            let context = Object.create(null);
            contexts.set("mouse" + (1 << event.button), context)
            recognizer.start(event,context)
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
                        recognizer.move(event,context);
                    }
                   
                    button = button << 1;
                }
            }
        
            let  mouseup = event => {
                let context = contexts.get("mouse" + (1 << event.button))
                recognizer.end(event,context)
                contexts.delete("mouse" + (1 << event.button))
        // 移除
            if(event.buttons === 0){
                document.removeEventListener("mousemove", mousemove);
                document.removeEventListener("mouseup", mouseup);
                isListeningMouse = false;
        
            }
            
            }
        
            if(!isListeningMouse){
                document.addEventListener("mousemove", mousemove);
                document.addEventListener("mouseup", mouseup);
                isListeningMouse = true;
            }
            
        })


        element.addEventListener('touchstart', event => {
            // console.log(event.changedTouches)
            for(let touch of event.changedTouches){
                console.log(touch.clientX,touch.clientY);
                let context = Object.create(null);
                contexts.set(touch.identifier, context)
                recognizer. start(touch, context)
            }
        
        })
        element.addEventListener('touchmove', event => {
            for(let touch of event.changedTouches){
                console.log(touch.clientX,touch.clientY);
                contexts.get(touch.identifier)
                recognizer. move(touch,context)
            }
        })
        
        element.addEventListener('touchend', event => {
            for(let touch of event.changedTouches){
                console.log(touch.clientX,touch.clientY);
                contexts.get(touch.identifier)
                recognizer.end(touch,context)
                contexts.delete(touch.identifier)
            }
        })
        
        element.addEventListener('touchcancel', event => {
            for(let touch of event.changedTouches){
                console.log(touch.clientX,touch.clientY);
                contexts.get(touch.identifier)
                recognizer.cancel(touch,context)
            }
        })
    }
}

export class Recognizer {
    constructor(dispatcher){
        this.dispatcher= dispatcher;
    }
    start(point, context) {
        // console.log(point.clientX,point.clientY);
        context.startX = point.clientX;
        context.startY = point.clientY;
        context.points=[{
            t:Date.now(),
            x:point.clientX,
            y:point.clientY
        }]
        context.isTap = true;
        context.isPan = false;
        context.isPress = false;
        context.handler = setTimeout(()=>{
            context.isTap = false;
            context.isPan = false;
            context.isPress = true;
            context.handler = null;
            // console.log('press start')
            this.dispatcher.dispatch("press",{})
        },500)
    
    }

    move(point, context) {
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
    
        // 开平方比较耗费运算，所以直接用平方进行比较。10px
        if(!context.isPan && dx **2 + dy **2 > 100){
            context.isTap = false;
            context.isPan = true;
            context.isPress = false;
            context.isVertical = Math.abs(dx) < Math.abs(dy);
            // console.log("pan start")
            this.dispatcher.dispatch("panstart",{
                startX: context.startX,
                startY:context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: Math.abs(dx) < Math.abs(dy)
            })
            clearTimeout(context.handler);
        }
        if(context.isPan){
            console.log(dx,dy)
            console.log("pan")
            this.dispatcher.dispatch("pan",{
                startX: context.startX,
                startY:context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: Math.abs(dx) < Math.abs(dy)
            })
        }
        // 只存取半秒内的
        context.points = context.points.filter(point=>Date.now() - point.t < 500)
        context.points.push(
            {
                t:Date.now(),
                x:point.clientX,
                y:point.clientY
            }
        )
    }
    end (point,context) {
        if(context.isTap){
            console.log("Tap");
            this.dispatcher.dispatch("tap", {})
            clearTimeout(handler);
        }
       
        if(context.isPress){
            console.log("press end");
            this.dispatcher.dispatch("pressend", {})
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
            this.dispatcher.dispatch("flick",{
                startX: context.startX,
                startY:context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: Math.abs(dx) < Math.abs(dy),
                isFlick:context.isFlick,
                velocity: v
            })
            context.isFlick = true;
        }else{
            context.isFlick = false;
        }
        if(context.isPan){
            console.log("panned");
            this.dispatcher.dispatch("panned",{
                startX: context.startX,
                startY:context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: Math.abs(dx) < Math.abs(dy),
                isFlick:context.isFlick,
            })
        }
    } 
    cancel(point,context) {

        clearTimeout(context.handler);
        this.dispatcher.dispatch("cancel", {})
    }
    


}
export function enableGesture(element){
    new Listener(new Recognizer(new Dispatcher(element)))
}