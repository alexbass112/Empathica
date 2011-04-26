/** 
    Auto-layout methods. Layout is currently performed only if a 
    Graph contains nodes created by the chatbot (i.e. having no set 
    position) when db_getGraphData() is called.
    
    Author:         Alex Bass
    Last Updated:   2011-04-17
 **/ 

/**
    Simple circular layout of nodes arranges nodes evenly in a circle
**/
Graph.prototype.circleLayout = function() {
    var oldValues = {};
    var newValues = {};
    
    // Save old values
    for (var i in g.nodes) {
        var n = g.nodes[i];
        oldValues[i] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
    }
    
    var w = g.canvas.width;
    var h = g.canvas.height;
    
    // Radius
    var radius = h;
    if (w < h) {
        radius = w;
    }
    radius /= 2;
    radius -= 50;
    
    // Centre point
    var cx = w/2;
    var cy = h/2;
    
    // Number of objects to layout
    var objCount = 0;
    for (var i in g.nodes) {
        objCount++;
    }
    
    if (objCount == 0) {
        return;
    }
    
    // Layout
    var angPart = Math.PI * 2 / objCount;
    var coordAngle = 0;
    for (var i in g.nodes) {
        var x = radius * Math.cos(coordAngle);
        var y = radius * Math.sin(coordAngle);
        x += cx;
        y += cy;
        
        var n = g.nodes[i];
        
        n.dim = {};
        n.dim.x = x;
        n.dim.y = y;
        n.dim.width = 0;
        n.dim.height = 0;
        g.setSizeByText(g.ctx, n);
        
        newValues[i] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
        
        coordAngle += angPart;
    }
    
    this.pushToUndo(new Command(this.cmdNode, guid(), this.cmdLayout, oldValues, newValues));
    
}

/**
    Position the screen at the geometric centre of the Nodes in the Graph
**/ 
Graph.prototype.centreGraph = function() {
    var canvas = document.getElementById(this.canvasName);

    // For undo
    var oldValues = {};
    var newValues = {};
    
    // Calculate the current and theoretical centres
    var curC = [0,0];
    var nodeCount = 0;
    for (var i in this.nodes) {
        nodeCount++;
        var n = this.nodes[i];
        curC[0] += n.dim.x;
        curC[1] += n.dim.y;
        oldValues[i] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
    }
    curC[0] /= nodeCount;
    curC[1] /= nodeCount;
    
    var canvasC = [canvas.width/2, canvas.height/2];
    
    // Calculate difference from canvas' centre
    var dx = canvasC[0] - curC[0];
    var dy = canvasC[1] - curC[1];
    
    // Adjust positions
    for (var i in this.nodes) {
        var n = this.nodes[i];
        n.dim.x += dx;
        n.dim.y += dy;
        newValues[i] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
    }
    
    // Adjust complex edge positions
    for (var i in this.edges) {
        var edge = g.edges[i];
        if (edge.innerPoints) {
            for (var p = 0; p < edge.innerPoints.length; p++) {
                edge.innerPoints[p].x += dx;
                edge.innerPoints[p].y += dy;
            }
        }
    }
    
    if (g.selectedObject instanceof Node || g.selectedObject instanceof Edge) {
        //g.positionSlider(g.selectedObject);
        g.showValenceSelector(g.selectedObject);
    }
    
    this.pushToUndo(new Command(this.cmdNode, guid(), this.cmdLayout, oldValues, newValues));
    
    this.repaint();
}

