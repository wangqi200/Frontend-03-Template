学习笔记
### 1、盒
盒模型
box-sizing:
* content-box
* border-box   包含了padding和border

### 2、正常流
正常流排版
* 收集盒进行
* 计算盒在行*中的排布
* 计算行的排布

line-box IFC 从左到右
block-box BFC 从上到下

### 3、正常流的行级排布
* Baseline
写英文的四线格   example   以e的底边为基线
中文是块状的文字，上边缘或者下边缘作为基线 会产生一定的偏移

文字的字形
freetype
![916d4c9f2295771f56d68c6c61a25d09.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p645)

###### 行模型
![c4d7b941976f6819a83573d7781a1003.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p646)

### 4、正常流的块级排布
* float 与 clear 
会影响行盒的尺寸
float 堆叠 不会互相占据空间
换行  可以使用 clear
float 会发生重排

* margin重叠
只会发生在正常流 BFC中

### 5、BFC合并
* Block
    * Block Container：里面有BFC的
        * 能容纳正常流的盒，里面就有BFC，想想有哪些？
    * Block-level Box：外面有BFC的
    * Block Box = Block Container + Block-level Box：里外都有BFC的

* Block Container
    * block
    * inline-block
    * table-cell
    * flex item
    * grid cell
    * table-caption
    

![450e65a20449979b034b8a82a4651a0b.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p648)
![eca023a95160363e71089ab08a322145.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p650)

* BFC合并
    * block box && overflow:visible
        * BFC合并与float
        * BFC合并与边距折叠
    
    
### 6、flex排版
* 收集 盒 进 行
* 计算 盒 在主轴方向的排布
* 计算 盒 在交叉轴方向的排布

### 7、动画
![e6da3f675e8d7f130c428f6d7dc11b87.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p651)
![e8d6c9d6f73b925caa0dd1abcce2f872.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p652)
![07726ff8855d772eb0bbae664fb6cf7e.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p653)
![295db3e9c2c0be862191058733af8316.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p654)

timing-function 来自一个三次贝塞尔曲线
[查看三次贝塞尔曲线的网站](Https://cubic-bezier.com/#.17,.67,.83,.67)

### 8、颜色
![925edf909e98f9aadb5d8d94591070e9.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p655)
HSL  HSV 

### 9、绘制
![265fd947603ebbb67cf6abfc7e47b950.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p656)
shader


![9b4cfedfbe0d76676eee144ba5c62856.png](evernotecid://725EDF89-9BBC-488E-95B1-5F483F5827F7/appyinxiangcom/17650854/ENResource/p657)
