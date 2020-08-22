// 预处理逻辑
function getStyle(element) {
    if (!element.style)
        element.style = {};

    // console.log("----style----")
    for (let prop in element.computedStyle) {
        // console.log(prop);
        // style对象用来存最后计算出来的属性
        var p = element.computedStyle.value;
        element.style[prop] = element.computedStyle[prop].value;

        // 用px标识的属性变成纯粹的数字
        if (element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
        if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }
    }
    return element.style;
}

function layout(element) {
    if (!element.computedStyle)
        return;

    // style 预处理
    var elementStyle = getStyle(element);
    // 目前toybrowser 只处理 flex
    if (elementStyle.display !== 'flex')
        return

    // 把文本节点过滤掉
    var items = element.children.filter(e => e.type === 'element');

    items.sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
    });

    // 把style取出来处理主轴和交叉轴
    var style = elementStyle;

    ['width', 'height'].forEach(size => {
        if (style[size] === 'auto' || style[size] === '') {
            style[size] = null;
        }
    })

    // 设置默认值
    if (!style.flexDirection || style.flexDirection === 'auto')
        style.flexDirection = 'row';
    if (!style.alignItems || style.alignItems === 'auto')
        style.alignItems = 'stretch';
    if (!style.justifyContent || style.justifyContent === 'auto')
        style.justifyContent = 'flex-start';
    if (!style.flexWrap || style.flexWrap === 'auto')
        style.flexWrap = 'nowrap';
    if (!style.alignContent || style.alignContent === 'auto')
        style.alignContent = 'stretch';

    var mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;

    if (style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if (style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if (style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if (style.flexWrap === 'wrap-reverse') {
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = 1;
    }

    // 如果父元素没有设置主轴尺寸，由子元素把它撑开
    var isAutoMainSize = false;
    if(!style[mainSize]){
        elementStyle[mainSize] = 0;
        for(var i = 0; i < items.length; i++){
            var item = items[i];
            // ？为什么是itemStyle
            if(itemStyle[mainSize] != null || itemStyle[mainSize] !== (void 0))
                elementStyle[mainSize] = elementStyle[mainSign] + itemStyle[mainSize]
        }
        isAutoMainSize = true;
        // style.flexWrap = 'nowrap';
    }

// 行 hang
    var flexLine = [];
    // 所有的行 放进一个数组 至少有一行
    var flexLines = [flexLine]
    // 剩余空间
    var mainSpace = elementStyle[mainSize];
    var crossSpace = 0;

    for(var i = 0; i < items.length; i++){
        var item = items[i];
        var itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null){
            itemStyle[mainSize] = 0;
        }

        // 有 flex属性  说明这个元素是个可伸缩的
        if(itemStyle.flex){
            flexLine.push(item);
        }else if(style.flexWrap === 'nowrap' && isAutoMainSize){
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                // 行高
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        }else{
            if(itemStyle[mainSize] > style[mainSize]){
                itemStyle[mainSize] = style[mainSize];
            }
            if(mainSpace < itemStyle[mainSize]){
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                // 创建新行
                flexLine = [item];
                flexLines.push(flexLine);
                // 重置
                mainSpace = style[mainSize];
                crossSpace = 0;
            }else{
                flexLine.push(item);
            }
            // 计算主轴和交叉轴的尺寸
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;

    console.log(items);
}
module.exports = layout;


// 总结：1、抽象成 main cross属性
// 2、flex子元素，flex item 收进各个行里面去
// 根据主轴尺寸，把元素分进 行
// 若设置了 no-wrap，则强行分配进第一行