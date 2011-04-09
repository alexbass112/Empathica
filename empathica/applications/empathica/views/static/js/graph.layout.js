
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


Graph.prototype.layout = function() {
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext('2d');

    // For undo 
    var oldValues = {};
    var newValues = {};
    
    /* 
        Setup - set random positions and 0 velocities
    */
    var posHash = {};
    for (i in this.nodes) {
        var n = this.nodes[i];
        oldValues[i] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
        
        // Velocity
        n.vx = 0;
        n.vy = 0;
        
        // Position
        //var randx = n.dim.width/2 + Math.random() * (canvas.width - 10 - n.dim.width);
        var randx = canvas.width * 0.3 + Math.random() * (canvas.width * 0.4);
        //var randy = n.dim.height/2 + Math.random() * (canvas.height - 10 - n.dim.height);
        var randy = canvas.height * 0.3 + Math.random() * (canvas.height * 0.4);
        var key = randx + 'x' + randy;
        
        // Keep searching for a new position until we get a new key
        while (! (posHash[key] === undefined)) {
            //randx = n.dim.width/2 + Math.random() * (canvas.width - 10 - n.dim.width);
            //randy = n.dim.height/2 + Math.random() * (canvas.height - 10 - n.dim.height);
            randx = canvas.width * 0.3 + Math.random() * (canvas.width * 0.4);
            randy = canvas.height * 0.3 + Math.random() * (canvas.height * 0.4);
            key = randx + 'x' + randy;
        }
        
        n.dim.x = randx;
        n.dim.y = randy;
        posHash[key] = 1;
    }
    
    /* 
        Main loop
    */
    var kinE = 100.0;
    var time = 0;
    while (kinE > 0.5 && time < 100) {
        time++;
        //debugOut('time ' + time);
        kinE = 0.0;
        
        for (i in this.nodes) {
            var n = this.nodes[i];
            var netF = [0, 0];
            
            for (j in this.nodes) {
                if (j == i) continue;
                var p = this.nodes[j];
                var cf = this.coulomb(n, p);
                netF[0] += cf[0];
                netF[1] += cf[1];
            }
            
            //debugOut('netF after Coulomb' + netF);
            
            for (e in this.edges) {
                var edge = this.edges[e];
                var hf = [0,0];
                if (edge.from == n.id) {
                    hf = this.hooke(n, this.nodes[edge.to]);
                } else if (edge.to == n.id) {
                    hf = this.hooke(n, this.nodes[edge.from]);
                } 
                
                netF[0] += hf[0];
                netF[1] += hf[1];
            }
            
            //debugOut('netF after Hooke' + netF);
            
            n.vx = (n.vx + netF[0]) ;
            n.vy = (n.vy + netF[1]) ;
            
            var oldx = n.dim.x;
            var oldy = n.dim.y;
            
            //debugOut(n.vx);
            
            //debugOut('velocity: ' + n.vx + ', ' + n.vy);
            
            //debugOut(i);
            //debugOut('prev ' + n.dim.x);
            n.dim.x += (n.vx * 0.1);
            n.dim.y += (n.vy * 0.1);
            //debugOut('new  ' + n.dim.x);
            
            if (n.dim.x < 100 || n.dim.x > canvas.width - 100) {
                n.dim.x = oldx;
            }
            if (n.dim.y < 100 || n.dim.y > canvas.height - 100) {
                n.dim.y = oldy;
            }
            
            kinE += (n.vx * n.vx + n.vy * n.vy);
        } // for each node
        
        //debugOut('kinE ' + kinE);
        
        this.repaint();
        
    } // end while
    
    debugOut('Final ke: ' + kinE);
    
    // Store new values 
    for (var i in this.nodes) {
        var n = this.nodes[i];
        g.setSizeByText(ctx, n, false);
        newValues[i] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
    }
    
    this.pushToUndo(new Command(this.cmdNode, guid(), this.cmdLayout, oldValues, newValues));
    
    //this.centreGraph();
}

Graph.prototype.coulomb = function(n, p) {
    var f = [0,0];
    var r = distanceBetweenPoints(n.dim.x, n.dim.y, p.dim.x, p.dim.y);
    var k = 50000;
    
    var mag = k / (r*r);
    
    var ang = angle(n.dim.x, n.dim.y, p.dim.x, p.dim.y);
    
    // Figure out the force direction on n
    if (n.dim.x < p.dim.x) {
        f[0] = -1 * mag * Math.cos(ang);
    } else {
        f[0] = mag * Math.cos(ang);
    }
    
    if (n.dim.y < p.dim.y) {
        f[1] = -1 * mag * Math.sin(ang);
    } else {
        f[1] = mag * Math.sin(ang);
    }
    
    //var r = n.dim.x - p.dim.x;
    //f[0] = (r == 0 ? 0 : k * n.valence * p.valence / ( r * r ));
    //r = n.dim.y - p.dim.y;
    //f[1] = (r == 0 ? 0 : k * n.valence * p.valence / ( r * r ));
    
    //debugOut('f ' + f);
    
    /*if (Math.abs(f[0]) > 0.1 || Math.abs(f[1]) > 0.1) {
        debugOut(f);
    }*/
    
    return f;
}

Graph.prototype.hooke = function(n, p) {
    var f = [0,0];
    var k = 0.005;
    
    var mag = k * distanceBetweenPoints(n.dim.x, n.dim.y, p.dim.x, p.dim.y);
    var ang = angle(n.dim.x, n.dim.y, p.dim.x, p.dim.y);
    
    //f[0] = k * Math.abs(n.dim.x - p.dim.x);
    //f[1] = k * Math.abs(n.dim.y - p.dim.y);
    
    if (n.dim.x < p.dim.x) {
        f[0] = mag;
    } else {
        f[0] = -1 * mag;
    }
    
    f[0] *= Math.cos(ang);
    
    if (n.dim.y < p.dim.y) {
        f[1] = mag;
    } else {
        f[1] = -1 * mag;
    }
    
    f[1] *= Math.sin(ang);
    //debugOut(f);
    
    return f;
}

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
    
    if (g.selectedObject instanceof Node || g.selectedObject instanceof Edge) {
        //g.positionSlider(g.selectedObject);
        g.showValenceSelector(g.selectedObject);
    }
    
    this.pushToUndo(new Command(this.cmdNode, guid(), this.cmdLayout, oldValues, newValues));
    
    this.repaint();
}

