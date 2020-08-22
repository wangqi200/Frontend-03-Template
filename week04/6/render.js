const images = require('images');

function render(viewport,element){
    if(element.style){
        // height 没有值？
        var img = images(element.style.width, element.style.height);

        if(element.style["background-color"]){
            let color = element.style["background-color"] || "rgb(0,0,0)";
            color.match(/rgb\((\d+),(\d+),(\d+)\)/);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
            viewport.draw(img,element.style.left||0,element.style.top||0);
        }
    }
    if(element.children){
        for(var child of element.children){
            render(viewport, child);
        }
    }
}

module.exports = render;

/**
 * 绘制需要依赖一个图形环境
 * 我们这里采用了npm包images
 * 绘制在一个viewport上进行
 * 与绘制相关的属性：background-color、border
 * 
 * 
 * 
 * 递归调用子元素的绘制方法完成DOM树的绘制
 * 忽略一些不需要绘制的节点
 * 实际浏览器中，文字绘制是难点，需要依赖字体库，我们这里忽略
 * 实际浏览器中，还会对一些图层做compositing，我们这里也忽略了
 */