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
    if (!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            // ？为什么是itemStyle，下面这句是后补充的
            var itemStyle = getStyle(item);

            if (itemStyle[mainSize] != null || itemStyle[mainSize] !== (void 0))
                elementStyle[mainSize] = elementStyle[mainSign] + itemStyle[mainSize]
        }
        isAutoMainSize = true;
        // style.flexWrap = 'nowrap';
    }

    // 行 hang   这里貌似有问题 ***
    var flexLine = [];
    // 所有的行 放进一个数组 至少有一行
    var flexLines = [flexLine]
    // 剩余空间
    var mainSpace = elementStyle[mainSize];
    var crossSpace = 0;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemStyle = getStyle(item);

        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }

        // 有 flex属性  说明这个元素是个可伸缩的
        if (itemStyle.flex) {
            flexLine.push(item);
        } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                // 行高
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } 
        // else if (style.flexWrap === 'nowrap' && !isAutoMainSize) {
        //     // 如果是不折行且父元素没有设置主轴尺寸
        //     console.log('如果是不折行且父元素没有设置主轴尺寸')

        // } 
        else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                // 创建新行
                flexLine = [item];
                flexLines.push(flexLine);
                // 重置
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }
            // 计算主轴和交叉轴的尺寸
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;
    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] != undefined) ? style[crossSize] : crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }
    // 等比压缩   单行情况
    if (mainSpace < 0) {
        var scale = style[mainSize] / (style[mainSize] - mainSpace);
        var currentMain = mainBase;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemStyle = getStyle(item);
            if (itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    } else {
        flexLines.forEach(function (items) {
            var mainSpace = items.mainSpace;
            var flexTotal = 0;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemStyle = getStyle(item);
                if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }
            // 有flex元素的情况
            if (flexTotal > 0) {
                var currentMain = mainBase;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var itemStyle = getStyle(item);

                    if (itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            } else {
                if (style.justifyContent == 'flex-start') {
                    var currentMain = mainBase;
                    var step = 0;
                }
                if (style.justifyContent == 'flex-end') {
                    var currentMain = mainSpace * mainSign + mainBase;
                    var step = 0;
                }
                if (style.justifyContent == 'center') {
                    var currentMain = mainSpace / 2 * mainSign + mainBase;
                    var step = 0;
                }
                if (style.justifyContent == 'space-between') {

                    var step = mainSpace / (items.length - 1) * mainSign;
                    var currentMain = mainBase;
                }
                if (style.justifyContent == 'space-around') {

                    var step = mainSpace / items.length * mainSign;
                    var currentMain = step / 2 + mainBase;
                }
                for (var i = 0; i < items.length; i++) {
                    var item = item[i];
                    itemStyle[mainStart, currentMain];
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }


// 计算交叉轴尺寸  align-items,align-self
    var crossSpace;

    // 没行高 自动撑开
    if(!style[crossSize]){
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for(var i = 0; i < flexLines.length; i++){
            elementStyle[crossSize] = elementStyle[crossSize]+ flexLines[i].crossSpace;
        }
    }else{
        crossSpace = style[crossSize]
        for(var i = 0 ; i < flexLines.length; i++){
            crossSpace -= flexLines[i].crossSpace;
            // 得到剩余的行高
        }
    }


    if(style.flexWrap === 'wrap-reverse'){
        crossBase = style[crossSize];
    }else{
        crossBase = 0;
    }
    var lineSize = style[crossSize] / flexLines.length;

    var step;
    if(style.alignContent === 'flex-start'){
        crossBase += 0;
        step = 0;
    }
    if(style.alignContent === 'flex-end'){
        crossBase += crossSign*crossSpace;
        step = 0;
    }
    if(style.alignContent === 'center'){
        crossBase += crossSign*crossSpace;
        step = 0;
    }
    if(style.alignContent === 'space-between'){
        crossBase += 0;
        step = crossBase / (flexLines.length - 1);
    }
    if(style.alignContent === 'space-around'){
        
        step = crossBase / flexLines.length;
        crossBase += crossSign*step / 2;
    }
    if(style.alignContent === 'stretch'){
        crossBase += 0;
        step = 0;
    }

    flexLines.forEach(function(items){
        var lineCrossSize = style.alignContent === 'stretch'?
        items.crossSpace + crossSpace / flexLines.length :
        items.crossSpace;
        for(var i = 0; i < items.length; i++){
            var item = items[i];
            var itemStyle = getStyle(item);
            var align = itemStyle.alignSelf || style.alignItems;
            if(item === null){
                itemStyle[crossSize] = (align === 'stretch') ?
                lineCrossSize : 0
            }
            if(align === 'flex-start'){
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign*itemStyle[crossSize]
            }
            if(align === 'flex-end'){
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] + crossSign*itemStyle[crossSize]
            }
            if(align === 'center'){
                itemStyle[crossStart] = crossBase + crossSign*(lineCrossSize -itemStyle[crossSize])/2
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign*itemStyle[crossSize]
            }
            if(align === 'stretch'){
                itemStyle[crossStart] = crossBase;
                // 下面这一句不完整***  lineSize用在什么地方了
                // itemStyle[crossEnd] = crossBase + crossSign*((itemStyle[crossSize] !== null && itemStyle[crossSize]))

                // itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
                itemStyle[crossEnd] = crossBase + crossSign*itemStyle[crossSize]
                itemStyle[crossSize] = crossSign*itemStyle[crossSize]
            }
        }
        crossBase += crossSign*(lineCrossSize + step);
    });


    console.log(items);
}
module.exports = layout;

/**
 * // 总结：1、抽象成 main cross属性
// 2、flex子元素，flex item 收进各个行里面去
// 根据主轴尺寸，把元素分进 行
// 若设置了 no-wrap，则强行分配进第一行
4、计算交叉轴方向
根据每一行中最大元素尺寸计算行高
根据行高flex-align和item-align，确定元素具体位置
 * 
 */
