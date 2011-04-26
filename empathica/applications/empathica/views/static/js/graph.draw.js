/** 
    Functions used to draw Graph contents to the Canvas context
    
    Author:         Alex Bass
    Last Updated:   2011-04-17
 **/ 

/**
    Main function called to draw the nodes and edges
**/
Graph.prototype.draw = function() {
    var canvas = this.canvas;
    var ctx = this.ctx;
    
    // TODO: remove the added height these are currently put in to prevent
    // the canvas from showing scrollbars
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 1;

    this.drawEdges(ctx);
    
    this.drawNodes(ctx);
    
    if (this.outlineCanvas) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.canvasOutlineColour;
        ctx.strokeRect(0,0,canvas.width, canvas.height);
    }
}

/**
    Draw the Nodes
**/
Graph.prototype.drawNodes = function(ctx) {
    // Draw based on the draw order stack
    for (var i = 0; i < this.drawOrder.length; i++) {
        var node = this.nodes[this.drawOrder[i]];
        this.drawNode(ctx, node);
    }
    
}

/**
    Draw an individual Node to the context
**/
Graph.prototype.drawNode = function(ctx, node) {
    // Draw the paths for the shapes
    if (node.valence > this.neutralValence) {
        this.drawOval(ctx, node);
        ctx.fillStyle = ( node.selected ? this.theme.nodePositiveFillFocused : this.theme.nodePositiveFillNormal );
        ctx.strokeStyle = ( node.selected ? this.theme.nodePositiveLineFocused : this.theme.nodePositiveLineNormal );
        if (!node.selected) {
            if (this.hoverObject == node) {
                ctx.fillStyle = this.theme.nodePositiveFillHover;
                ctx.strokeStyle = this.theme.nodePositiveLineHover;
            }
        }
    } else if (node.valence < this.neutralValence) {
        this.drawHex(ctx, node);
        ctx.fillStyle = ( node.selected ? this.theme.nodeNegativeFillFocused : this.theme.nodeNegativeFillNormal );
        ctx.strokeStyle = ( node.selected ? this.theme.nodeNegativeLineFocused : this.theme.nodeNegativeLineNormal );
        if (!node.selected) {
            if (this.hoverObject == node) {
                ctx.fillStyle = this.theme.nodeNegativeFillHover;
                ctx.strokeStyle = this.theme.nodeNegativeLineHover;
            }
        }
    } else {
        this.drawRect(ctx, node);
        ctx.fillStyle = ( node.selected ? this.theme.nodeNeutralFillFocused : this.theme.nodeNeutralFillNormal );
        ctx.strokeStyle = ( node.selected ? this.theme.nodeNeutralLineFocused : this.theme.nodeNeutralLineNormal );
        if (!node.selected) {
            if (this.hoverObject == node) {
                ctx.fillStyle = this.theme.nodeNeutralFillHover;
                ctx.strokeStyle = this.theme.nodeNeutralLineHover;
            }
        }
    }
    
    // Fill in and outline
    ctx.fill();
    
    // Draw the border
    ctx.lineWidth = this.nodeOutlineWidth + Math.abs(node.valence * this.nodeOutlineVariance);
    ctx.stroke();
    
    // Draw text
    this.drawText(ctx, node);

    if (node.selected) {
        this.drawSelectionHandles(ctx,node);
    }
}

/** 
    Draw the Edges
**/
Graph.prototype.drawEdges = function(ctx) {
    ctx.strokeStyle = this.edgeColour;
    ctx.lineCap = this.edgeLineCap;
    for(i in this.edges) {
        var edge = this.edges[i];
        this.drawEdge(ctx, edge);
    }
}

/**
    Draw an individual Edge to the context
**/
Graph.prototype.drawEdge = function(ctx, edge) {
    ctx.lineCap = this.edgeLineCap;
    
    var from = this.nodes[edge.from];
    var to = this.nodes[edge.to];
    
    ctx.lineWidth = this.edgeWidth + Math.abs(edge.valence * this.edgeVariance);

    ctx.beginPath();
    if (edge.valence < this.neutralValence) {
        // if any inner points
        ctx.strokeStyle = ( edge.selected ? this.theme.edgeNegativeLineFocused : this.theme.edgeNegativeLineNormal );
        if (this.hoverObject == edge && !edge.selected) {
            ctx.strokeStyle = this.theme.edgeNegativeLineHover;
        }
        if (edge.innerPoints && edge.innerPoints.length > 0) {
            var pts = edge.innerPoints;
            
            var test1 = from.dim.x;
            var test2 = pts[0].x;
            
            ctx.dashedLineTo(from.dim.x, from.dim.y, pts[0].x, pts[0].y, this.dashedPattern);
            for (var i = 0; i < pts.length - 1; i++) {
                ctx.dashedLineTo(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y, this.dashedPattern);
            }
            ctx.dashedLineTo(pts[pts.length-1].x, pts[pts.length-1].y, to.dim.x, to.dim.y, this.dashedPattern);
        } else {
            ctx.dashedLineTo(from.dim.x, from.dim.y, to.dim.x, to.dim.y, this.dashedPattern);
        }
    } else {
        ctx.strokeStyle = ( edge.selected ? this.theme.edgePositiveLineFocused : this.theme.edgePositiveLineNormal );
        if (this.hoverObject == edge && !edge.selected) {
            ctx.strokeStyle = this.theme.edgePositiveLineHover;
        }
        if (edge.innerPoints && edge.innerPoints.length > 0) {
            var pts = edge.innerPoints;
            ctx.moveTo(from.dim.x, from.dim.y);
            for (var i = 0; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.lineTo(to.dim.x, to.dim.y);
        } else {
            ctx.moveTo(from.dim.x, from.dim.y);
            ctx.lineTo(to.dim.x, to.dim.y);
        }
    }
    
    if (edge.selected) {
        this.edgeSelectedStyleOn(ctx, edge);
        ctx.stroke();
        this.edgeStyleNormal(ctx, edge);
    } else if (this.hoverObject == edge) {
        this.edgeHoverStyleOn(ctx, edge);
        ctx.stroke();
        this.edgeStyleNormal(ctx, edge);
    } else {
        ctx.stroke();
    }

}

/**
    Drawing the shapes
    These functions are also used to draw Node outlines for determining Node selection
**/
Graph.prototype.drawRect = function(ctx, node) {
    ctx.beginPath(); 
    ctx.moveTo(node.dim.x - (node.dim.width/2)*this.zoomScale, node.dim.y - (node.dim.height/2)*this.zoomScale); 
    ctx.lineTo(node.dim.x + (node.dim.width/2)*this.zoomScale, node.dim.y - (node.dim.height/2)*this.zoomScale); 
    ctx.lineTo(node.dim.x + (node.dim.width/2)*this.zoomScale, node.dim.y + (node.dim.height/2)*this.zoomScale); 
    ctx.lineTo(node.dim.x - (node.dim.width/2)*this.zoomScale, node.dim.y + (node.dim.height/2)*this.zoomScale); 
    ctx.closePath();
}
Graph.prototype.drawOval = function(ctx, node) {
    // Code from http://www.html5canvastutorials.com/tutorials/html5-canvas-ovals/
    var controlRectWidth = node.dim.width * 1.25 ;
 
    ctx.beginPath();
    ctx.moveTo(node.dim.x,node.dim.y - node.dim.height/2 * this.zoomScale);
    // draw left side of oval
    ctx.bezierCurveTo(node.dim.x-controlRectWidth/2 * this.zoomScale, node.dim.y-node.dim.height/2 * this.zoomScale,
        node.dim.x-controlRectWidth/2 * this.zoomScale, node.dim.y+node.dim.height/2 * this.zoomScale,
        node.dim.x,node.dim.y+node.dim.height/2 * this.zoomScale);
 
    // draw right side of oval
    ctx.bezierCurveTo(node.dim.x+controlRectWidth/2 * this.zoomScale, node.dim.y+node.dim.height/2 * this.zoomScale,
        node.dim.x+controlRectWidth/2 * this.zoomScale, node.dim.y-node.dim.height/2 * this.zoomScale,
        node.dim.x,node.dim.y-node.dim.height/2 * this.zoomScale);
    
    ctx.closePath();
}
Graph.prototype.drawHex = function(ctx, node) {
    ctx.beginPath();
    
    ctx.moveTo(node.dim.x - this.hexOffset*(node.dim.width/2), node.dim.y - node.dim.height/2);
    ctx.lineTo(node.dim.x + this.hexOffset*(node.dim.width/2), node.dim.y - node.dim.height/2);
    ctx.lineTo(node.dim.x + node.dim.width/2, node.dim.y);
    ctx.lineTo(node.dim.x + this.hexOffset*(node.dim.width/2), node.dim.y + node.dim.height/2);
    ctx.lineTo(node.dim.x - this.hexOffset*(node.dim.width/2), node.dim.y + node.dim.height/2);
    ctx.lineTo(node.dim.x - node.dim.width/2, node.dim.y); 
    ctx.lineTo(node.dim.x - this.hexOffset*(node.dim.width/2), node.dim.y - node.dim.height/2);
    
    ctx.closePath();
}

/**
    Draw selection handles around outside of shape
**/
Graph.prototype.drawSelectionHandles = function(ctx, node) {

    this.handleContext = ctx;

    var saveFillStyle = ctx.fillStyle;
    
    ctx.fillStyle = this.theme.nodeSelectionHandles;
    ctx.fillRect(node.dim.x - node.dim.width/2 - this.handleSize/2, 
                node.dim.y - node.dim.height/2 - this.handleSize/2,
                this.handleSize, this.handleSize);
    
    ctx.fillRect(node.dim.x + node.dim.width/2 - this.handleSize/2, 
                node.dim.y - node.dim.height/2 - this.handleSize/2,
                this.handleSize, this.handleSize);
                
    ctx.fillRect(node.dim.x - node.dim.width/2 - this.handleSize/2, 
                node.dim.y + node.dim.height/2 - this.handleSize/2,
                this.handleSize, this.handleSize);
                
    ctx.fillRect(node.dim.x + node.dim.width/2 - this.handleSize/2, 
                node.dim.y + node.dim.height/2 - this.handleSize/2,
                this.handleSize, this.handleSize);
                
    ctx.fillStyle = saveFillStyle;
}

/**
    Turn on shadows for the subsequently drawn elements
**/
Graph.prototype.edgeSelectedStyleOn = function(ctx, edge) {
    ctx.shadowBlur = parseInt(this.theme.edgeGlowSize);
    if (edge.valence < this.neutralValence) {
        ctx.shadowColor = this.theme.edgeNegativeGlowFocused;
    } else {
        ctx.shadowColor = this.theme.edgePositiveGlowFocused;
    }
}

/**
    Turn off shadows for the subsequently drawn elements
**/
Graph.prototype.edgeStyleNormal = function(ctx, edge) {
    ctx.shadowBlur = 0;
    if (edge.valence < this.neutralValence) {
        ctx.shadowColor = this.theme.edgeNegativeGlowNormal;
    } else {
        ctx.shadowColor = this.theme.edgePositiveGlowNormal;
    }
}

/**
    Style hovered Edges
**/
Graph.prototype.edgeHoverStyleOn = function(ctx, edge) {
    ctx.shadowBlur = parseInt(this.theme.edgeGlowSize);
    if (edge.valence < this.neutralValence) {
        ctx.shadowColor = this.theme.edgeNegativeGlowHover;
    } else {
        ctx.shadowColor = this.theme.edgePositiveGlowHover;
    }
}

/**
    Fill in the text of a node centred horizontally and vertically in the node
**/
Graph.prototype.drawText = function(ctx, node) {
    var style = this.theme.nodeFontSize + ' ' + this.theme.nodeFontFamily;
    if (Math.abs(node.valence) > this.strongThreshold) {
        style = "bold " + style;
    }
    
    ctx.font = style;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    
    if (node.valence > this.neutralValence) {
        ctx.fillStyle = ( node.selected ? this.theme.nodePositiveFontFocused : this.theme.nodePositiveFontNormal );
    } else if (node.valence < this.neutralValence) {
        ctx.fillStyle = ( node.selected ? this.theme.nodeNegativeFontFocused : this.theme.nodeNegativeFontNormal );
    } else {
        ctx.fillStyle = ( node.selected ? this.theme.nodeNeutralFontFocused : this.theme.nodeNeutralFontNormal );
    }
    
    // determine x and y - want to centre the text in the node 
    var x = node.dim.x;
    var y = node.dim.y;
    
    var lines = this.getTextLines(ctx, node);
    
    // Centre everything vertically based on line height
    var startY = y - lines.length * parseInt(this.theme.nodeFontLineHeight) / 2;
    
    for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, startY + parseInt(this.theme.nodeFontLineHeight) * i);
    }
}

/**
    Save the canvas content as a PNG image. If thumb is true, creates a 
    407 x 260 thumbnail for the Conflict Overview page. 
    
    @returns a string containing the PNG image data. 
**/
Graph.prototype.createImage = function(thumb) {
    var canvas = this.canvas;
    var ctx = this.ctx;
    var img = new Image();
    var canvasCopy = document.createElement("canvas");
    
    if (thumb) {
        canvasCopy.width = 407;
        canvasCopy.height = 260;
        var contextCopy = canvasCopy.getContext("2d");
        contextCopy.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasCopy.width, canvasCopy.height);
    } else { 
        var bounds = this.getBounds();
        canvasCopy.width = bounds.right - bounds.left + 10;
        canvasCopy.height = bounds.bottom - bounds.top + 10;
        var contextCopy = canvasCopy.getContext("2d");
        debugOut(bounds);
        debugOut(canvasCopy.width);
        debugOut(canvasCopy.height);
        contextCopy.drawImage(canvas, Math.max(0,bounds.left -5), Math.max(0,bounds.top -5), canvasCopy.width, canvasCopy.height, 0, 0, canvasCopy.width, canvasCopy.height);
    }
    
    var thumb = canvasCopy.toDataURL("image/png");
    
    return thumb;
}

/**
    Find the bounding box fitting all the shapes in the Graph
**/
Graph.prototype.getBounds = function() {
    var bounds = {};
    var nodeCount = 0;
    var first = "";
    for (var i in this.nodes) { nodeCount++; first = i;}
    if (nodeCount == 0) {
        bounds.left = 0;
        bounds.top = 0;
        bounds.right = 100;
        bounds.bottom = 100;
        return bounds;
    }
    
    bounds.left = this.nodes[first].dim.x - this.nodes[first].dim.width/2;
    bounds.top = this.nodes[first].dim.y - this.nodes[first].dim.height/2;
    bounds.right = this.nodes[first].dim.x + this.nodes[first].dim.width/2;
    bounds.bottom = this.nodes[first].dim.y + this.nodes[first].dim.height/2;
    
    for (var i in this.nodes) {
        var n = this.nodes[i];
        if (n.dim.x - n.dim.width/2 < bounds.left) {
            bounds.left = n.dim.x - n.dim.width/2;
        }
        if (n.dim.x + n.dim.width/2 > bounds.right) {
            bounds.right = n.dim.x + n.dim.width/2;
        }
        if (n.dim.y - n.dim.height/2 < bounds.top) {
            bounds.top = n.dim.y - n.dim.width/2;
        }
        if (n.dim.y + n.dim.height/2 > bounds.bottom) {
            bounds.bottom = n.dim.y + n.dim.width/2;
        }
    }
    
    for (var i in this.edges) {
        var e = this.edges[i];
        if (e.innerPoints && e.innerPoints.length > 0) {
            for (var p in e.innerPoints) {
                if (p.x < bounds.left) {
                    bounds.left = p.x;
                }
                if (p.x > bounds.right) {
                    bounds.right = p.x;
                }
                if (p.y < bounds.top) {
                    bounds.top = p.y;
                }
                if (p.y > bounds.bottom) {
                    bounds.bottom = p.y;
                }
            }
        }
    }
    
    return bounds;
}


