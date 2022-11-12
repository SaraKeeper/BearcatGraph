# BearcatGraph

#### version 2.0

---
 
### Authored by SaraKeeper

An Easier Graph Generating Tool on D3 Library for HTML&amp;JS Developers

---

&nbsp;

### 目标

- 支持 d3.js 绘图库
- 让 JavaScript 开发者更简单地绘图

&nbsp;

### 功能

- 绘制可拖动无向图

&nbsp;

### 范例
[范例展示](http://eojhelper.fun/undirected_graph.html)

[范例代码](https://github.com/SaraKeeper/BearcatGraph/blob/main/force_guide_graph_demo.html)

&nbsp;

### 使用

##### 引入依赖资源
```html
<script src="http://eojhelper.fun/cdn/d3force.min.js"></script>
<script src="http://eojhelper.fun/cdn/bearcat_graph_v2.0.js"></script>
```
##### 如果资源加载慢，可以更换下载源为：
```html
<script src="https://poetry0.oss-cn-hongkong.aliyuncs.com/d3force.min.js"></script>
<script src="https://poetry0.oss-cn-hongkong.aliyuncs.com/bearcat_graph_v2.0.js"></script>
```
##### 绘制图
```javascript
let forceGuideGraph = new ForceGuideGraph("container",600,400);
forceGuideGraph.setElements(
    [
        {no:1, x:100, y:200, r:30, ic:"#ABB4FF", io:1.0, bc:"#1890FF", bw:1},
        {no:2, x:300, y:300, r:10, ic:"#3E7B9B", io:1.0, bc:"#1890FF", bw:2},
        {no:3, x:500, y:200, r:20, ic:"#8CC084", io:1.0, bc:"#1890FF", bw:3}
    ],
    [
        {n1:1, n2:2, c:"#000000", w:2},
        {n1:1, n2:3, c:"#000000", w:2}
    ]
);
forceGuideGraph.setConfig({
    "initFix": true,
    "draggable": true,
    "dragFix": true,
    "clickExchange": true,
    "fixInnerColor": "#FF0000",
    "fixInnerOpacity": 1.0,
    "fixBorderColor": "#FF0000",
    "fixBorderWidth": 0,
    "guideSpeed": 0.3
});
forceGuideGraph.showGraph();
```

&nbsp;

### API

##### 创建图对象
```javascript
// 在 id 为 container 的 html 元素内部创建 600×400 图对象
new ForceGuideGraph("container",600,400);
```
##### 创建图对象
```javascript
// 为图对象 undirectedGraph 设置点和边
// 点的参数如下：
// no:编号(非负整数)，x,y:位置，r:半径
// ic:innerColor点颜色，io:innerOpacity点透明度
// bc:borderColor边界颜色，bw:borderWidth边界宽度
forceGuideGraph.setElements(
    [
        {no:1, x:100, y:200, r:30, ic:"#ABB4FF", io:1.0, bc:"#1890FF", bw:1},
        {no:2, x:300, y:300, r:10, ic:"#3E7B9B", io:1.0, bc:"#1890FF", bw:2},
        {no:3, x:500, y:200, r:20, ic:"#8CC084", io:1.0, bc:"#1890FF", bw:3}
    ],
    [
        {n1:1, n2:2, c:"#000000", w:2},
        {n1:1, n2:3, c:"#000000", w:2}
    ]
);
```
##### 配置图参数
```javascript
/**
 * initFix:点是否初始固定
 * draggable:是否可拖动
 * dragFix:点是否拖动固定
 * clickExchange:点是否单击变换状态
 * fixInnerColor:固定状态点统一颜色
 * fixInnerOpacity:固定状态点统一透明度
 * fixBorderColor:固定状态点统一边界颜色
 * fixBorderWidth:固定状态点统一边界宽度
 * guideSpeed:引导状态移动速度
 */
forceGuideGraph.setConfig({
    "initFix": true,
    "draggable": true,
    "dragFix": true,
    "clickExchange": true,
    "fixInnerColor": "#FF0000",
    "fixInnerOpacity": 1.0,
    "fixBorderColor": "#FF0000",
    "fixBorderWidth": 0,
    "guideSpeed": 0.3
});
```
##### 渲染图
```javascript
forceGuideGraph.showGraph();
```