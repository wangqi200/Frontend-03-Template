学习笔记

###绘制图像

1、抽象成 main cross属性
2、flex子元素，flex item 收进各个行里面去
    根据主轴尺寸，把元素分进 行
    若设置了 no-wrap，则强行分配进第一行
3、计算交叉轴方向
    根据每一行中最大元素尺寸计算行高
    根据行高flex-align和item-align，确定元素具体位置

4、 绘制需要依赖一个图形环境
  我们这里采用了npm包images
  绘制在一个viewport上进行
  与绘制相关的属性：background-color、border
  
  
  递归调用子元素的绘制方法完成DOM树的绘制
  忽略一些不需要绘制的节点
  实际浏览器中，文字绘制是难点，需要依赖字体库，我们这里忽略
  实际浏览器中，还会对一些图层做compositing，我们这里也忽略了
 