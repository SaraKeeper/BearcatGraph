/**
 * Created by SaraKeeper on 2022/11/11.
 * All Rights Reserved.
 */

class ForceGuideGraph {
    nodeFlag = "N";
    edgeFlag = "E";
    constructor(modelId, width, height) {
        this.#modelId = modelId;
        this.#sourceWidth = width;
        this.#sourceHeight = height;
        this.#sourceDom = this.#Area("#"+modelId,width,height);
        this.#nodeList = [];
        this.#nodeMap = new Map();
        this.#maxNodeNo = 0;
        this.#edgeMap = new Map();
        this.#n1EdgeMap = new Map();
        this.#n2EdgeMap = new Map();
        this.#configMap = new Map();
    }
    setElements(nodeList, edgeList) {
        let n1EdgeMap = new Map();
        let n2EdgeMap = new Map();

        let noOccupiedSet = new Set();
        let nodeMap = new Map();
        for(let node of nodeList) {
            if(node.no<0 || noOccupiedSet.has(node.no)) continue;
            if(node.x<node.r+node.bw || node.x>this.#sourceWidth-node.r-node.bw) continue;
            if(node.y<node.r+node.bw || node.y>this.#sourceHeight-node.r-node.bw) continue;
            noOccupiedSet.add(node.no);
            this.#maxNodeNo = Math.max(this.#maxNodeNo,node.no);
            nodeMap.set(node.no, {
                x:node.x, y:node.y, r:node.r, serial:this.#nodeList.length,
                ic:node.ic, io:node.io, bc:node.bc, bw:node.bw
            });
            n1EdgeMap.set(node.no, []);
            n2EdgeMap.set(node.no, []);
            this.#nodeList.push(node.no);
        }
        this.#nodeMap = nodeMap;

        let idOccupiedSet = new Set();
        let edgeMap = new Map();
        for(let edge of edgeList) {
            if(!noOccupiedSet.has(edge.n1) || !noOccupiedSet.has(edge.n2)) continue;
            let minNodeNo = Math.min(edge.n1,edge.n2);
            let maxNodeNo = Math.max(edge.n1,edge.n2);
            let edgeId = minNodeNo*(this.#maxNodeNo+1)+maxNodeNo;
            if(idOccupiedSet.has(edgeId)) continue;
            idOccupiedSet.add(edgeId);
            edgeMap.set(edgeId, {n1:edge.n1, n2:edge.n2, c:edge.c, w:edge.w});
            n1EdgeMap.get(edge.n1).push(edgeId);
            n2EdgeMap.get(edge.n2).push(edgeId);
        }
        this.#edgeMap = edgeMap;

        this.#n1EdgeMap = n1EdgeMap;
        this.#n2EdgeMap = n2EdgeMap;
    }
    setConfig(configMap) {
        this.#configMap.set("initFix", configMap["initFix"]===true);
        this.#configMap.set("draggable", configMap["draggable"]===true);
        this.#configMap.set("dragFix", configMap["dragFix"]===true);
        this.#configMap.set("clickExchange", configMap["clickExchange"]===true);
        this.#configMap.set("fixInnerColor", configMap["fixInnerColor"]);
        this.#configMap.set("fixInnerOpacity", configMap["fixInnerOpacity"]);
        this.#configMap.set("fixBorderColor", configMap["fixBorderColor"]);
        this.#configMap.set("fixBorderWidth", configMap["fixBorderWidth"]);
        this.#configMap.set("guideSpeed", Math.max(Math.min(1.0,configMap["guideSpeed"]),0.1));
    }
    showGraph() {
        let initFix = this.#configMap.get("initFix");
        let draggable = this.#configMap.get("draggable");
        let dragFix = this.#configMap.get("dragFix");
        let clickExchange = this.#configMap.get("clickExchange");
        let fixInnerColor = this.#configMap.get("fixInnerColor");
        let fixInnerOpacity = this.#configMap.get("fixInnerOpacity");
        let fixBorderColor = this.#configMap.get("fixBorderColor");
        let fixBorderWidth = this.#configMap.get("fixBorderWidth");
        let guideSpeed = this.#configMap.get("guideSpeed");

        let guideGraph = d3.forceSimulation().force("link",d3.forceLink()).force("charge",d3.forceManyBody())
            .force("center",d3.forceCenter(this.#sourceWidth/2,this.#sourceHeight/2)).on("tick",tickHelper);
        let d3Nodes = this.#GetD3Nodes();
        let d3Links = this.#GetD3Links();
        guideGraph.nodes(d3Nodes).force("link").links(d3Links).distance(d => d.value);
        let edge = this.#Edge(this.#sourceDom,d3Links);
        let nodeArea = this.#NodeArea(this.#sourceDom,d3Nodes,startHelper,dragHelper,endHelper,clickHelper,draggable);
        let node = this.#Node(nodeArea);
        this.#InitPosition();

        let needInitPos = true;
        let sourceWidth = this.#sourceWidth;
        let sourceHeight = this.#sourceHeight;
        let nodeMap = this.#nodeMap;
        function getProperPos(realX, realY, radius) {
            return [Math.min(Math.max(realX,radius),sourceWidth-radius),Math.min(Math.max(realY,radius),sourceHeight-radius)];
        }
        function tickHelper() {
            node.attr("cx",d => {d.x=getProperPos(d.x,d.y,d.r)[0]; d.fx = d.fix?d.x:null; return d.x;})
                .attr("cy",d => {d.y=getProperPos(d.x,d.y,d.r)[1]; d.fy = d.fix?d.y:null; return d.y;})
                .attr("fill",d => d.fix?fixInnerColor:d.ic).attr("opacity",d => d.fix?fixInnerOpacity:d.io)
                .attr("stroke",d => d.fix?fixBorderColor:d.bc).attr("stroke-width",d => d.fix?fixBorderWidth:d.bw);
            if(needInitPos && initFix) {
                needInitPos = false;
                node.attr("cx",d => {
                    let no = d.id.substring(1);
                    let nodeConfig = nodeMap.get(parseInt(no));
                    return d.fx = d.x = nodeConfig["x"];
                }).attr("cy",d => {
                    let no = d.id.substring(1);
                    let nodeConfig = nodeMap.get(parseInt(no));
                    return d.fy = d.y = nodeConfig["y"];
                });
            }
            edge.attr("x1",d => d.source.x).attr("y1",d => d.source.y).attr("x2",d => d.target.x).attr("y2",d => d.target.y);
        }
        function startHelper(d) {
            if(!d3.event.active) guideGraph.alphaTarget(guideSpeed).restart();
            d.fx = d.x;
            d.fy = d.y;
            if(dragFix) d.fix = true;
        }
        function dragHelper(d) {
            let properPos = getProperPos(d3.event.x,d3.event.y,d.r);
            d.fx = properPos[0];
            d.fy = properPos[1];
        }
        function endHelper(d) {
            if(!d3.event.active) guideGraph.alphaTarget(0);
        }
        function clickHelper(d) {
            if(clickExchange) d.fix = !d.fix;
        }
    }

    #modelId;
    #sourceDom;
    #sourceWidth;
    #sourceHeight;
    #nodeList;
    #nodeMap;
    #maxNodeNo;
    #edgeMap;
    #n1EdgeMap;
    #n2EdgeMap;
    #configMap;

    #Area = (source, width, height) => {
        return d3.select(source).append("svg").attr("width",width).attr("height",height);
    };
    #Edge = (source, edgeList) => {
        return source.selectAll("line").data(edgeList).enter().append("line").attr("id",d => d.id)
            .attr("stroke",d => d.c).attr("stroke-width",d => d.w);
    };
    #NodeArea = (source, nodeList, startFunc, dragFunc, endFunc, clickFunc, draggable) => {
        let nodeArea = source.selectAll(".circleText").data(nodeList).enter()
            .append("g").attr("id",d => d.id);
        if(draggable) {
            nodeArea.call(d3.drag().on("start",startFunc).on("drag",dragFunc).on("end",endFunc)).on("click",clickFunc);
        }
        return nodeArea;
    };
    #Node = (source) => {
        return source.append("circle").attr("r",d => d.r);
    };
    #InitPosition = () => {
    };
    #GetD3Nodes = () => {
        let d3Nodes = [];
        for(let nodeNo of this.#nodeList) {
            let node = this.#nodeMap.get(nodeNo);
            let fix = this.#configMap.get("initFix");
            d3Nodes.push({
                id:this.nodeFlag+nodeNo, cx:node.x, cy:node.y, r:node.r,
                ic:node.ic, io:node.io, bc:node.bc, bw:node.bw, fix:fix
            });
        }
        return d3Nodes;
    };
    #GetD3Links = () => {
        let d3Links = [];
        for(let edge of this.#edgeMap) {
            let n1Node = this.#nodeMap.get(edge[1].n1);
            let n2Node = this.#nodeMap.get(edge[1].n2);
            let distance = Math.sqrt(Math.pow(n1Node.x-n2Node.x,2)+Math.pow(n1Node.y-n2Node.y,2));
            d3Links.push({
                id:this.edgeFlag+edge[0], source:n1Node.serial, target:n2Node.serial,
                value:distance, c:edge[1].c, w:edge[1].w
            });
        }
        return d3Links;
    };
}