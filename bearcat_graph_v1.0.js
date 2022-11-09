/**
 * Created by SaraKeeper on 2022/11/07.
 */

class UndirectedGraph {
    nodeFlag = "N";
    edgeFlag = "E";
    constructor(modelId, width, height) {
        this.#modelId = modelId;
        this.#sourceWidth = width;
        this.#sourceHeight = height;
        this.#sourceDom = this.#Area("#"+modelId,width,height);
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
            nodeMap.set(node.no, {x:node.x, y:node.y, r:node.r, ic:node.ic, io:node.io, bc:node.bc, bw:node.bw});
            n1EdgeMap.set(node.no, []);
            n2EdgeMap.set(node.no, []);
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
        this.#configMap.set("draggable", configMap["draggable"]===true);
    }
    showGraph() {
        for(let [key,edge] of this.#edgeMap) {
            let n1 = this.#nodeMap.get(edge.n1);
            let n2 = this.#nodeMap.get(edge.n2);
            this.#Line(this.#sourceDom,n1.x,n1.y,n2.x,n2.y,edge.c,edge.w,this.edgeFlag+key);
        }
        for(let [key,node] of this.#nodeMap) {
            this.#Circle(this.#sourceDom,node.x,node.y,node.r,node.ic,node.io,node.bc,node.bw,this.nodeFlag+key);
        }

        let sourceWidth = this.#sourceWidth;
        let sourceHeight = this.#sourceHeight;
        let n1EdgeMap = this.#n1EdgeMap;
        let n2EdgeMap = this.#n2EdgeMap;
        let edgeFlag = this.edgeFlag;
        let dragHelper = function() {
            let circle = d3.select(this);
            let radius = parseInt(circle.attr("rx"))+parseInt(circle.attr("stroke-width"));
            let realX = d3.event.x;
            let realY = d3.event.y;
            let properX = Math.min(Math.max(realX,radius),sourceWidth-radius);
            let properY = Math.min(Math.max(realY,radius),sourceHeight-radius);
            circle.attr("cx",properX).attr("cy",properY);

            let circleId = parseInt(circle.attr("id").substring(1));
            let n1EdgeList = n1EdgeMap.get(circleId);
            let n2EdgeList = n2EdgeMap.get(circleId);
            for(let n1Edge of n1EdgeList) {
                d3.select("#"+edgeFlag+n1Edge).attr("x1",properX).attr("y1",properY);
            }
            for(let n2Edge of n2EdgeList) {
                d3.select("#"+edgeFlag+n2Edge).attr("x2",properX).attr("y2",properY);
            }
        };
        this.#sourceDom.selectAll("ellipse").call(d3.behavior.drag().on("drag",dragHelper));
    }

    #modelId;
    #sourceDom;
    #sourceWidth;
    #sourceHeight;
    #nodeMap;
    #maxNodeNo;
    #edgeMap;
    #n1EdgeMap;
    #n2EdgeMap;
    #configMap;

    #Area = (source, width, height) => {
        return d3.select(source).append("svg").attr("width",width).attr("height",height);
    };
    #Ellipse = (source, xCenter, yCenter, xHalf, yHalf, bodyColor, bodyOpacity, borderColor, borderWidth, id) => {
        source = (typeof source == "object" ? source : d3.select(source));
        return source.append("ellipse").attr("cx",xCenter).attr("cy",yCenter).attr("rx",xHalf).attr("ry",yHalf).attr("id",id)
            .attr("fill",bodyColor).attr("opacity",bodyOpacity).attr("stroke",borderColor).attr("stroke-width",borderWidth);
    };
    #Circle = (source, xCenter, yCenter, radius, bodyColor, bodyOpacity, borderColor, borderWidth, id) => {
        return this.#Ellipse(source, xCenter, yCenter, radius, radius, bodyColor, bodyOpacity, borderColor, borderWidth, id);
    };
    #Line = (source, xP, yP, xQ, yQ, bodyColor, bodyWidth, id) => {
        source = (typeof source == "object" ? source : d3.select(source));
        source.append("line").attr("x1",xP).attr("y1",yP).attr("x2",xQ).attr("y2",yQ)
            .attr("stroke",bodyColor).attr("stroke-width",bodyWidth).attr("id",id);
    }
}