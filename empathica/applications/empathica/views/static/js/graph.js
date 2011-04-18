
// Internal representation of the Graph object 
// used in mouse handler events where 'this' is 
// implicitly redefined. 
var g = new Object();

function Graph() {
    // CAM Graph

    // Name of canvas html element
    this.canvasName = "cam";
    // HTML5 canvas elements
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    this.canvas = canvas;
    this.ctx = ctx;

    // For auto-assigning IDs to nodes in the graph
    this.nextId = 0; // To be deprecated once integrated with DB
    
    // Disable channels for dev without GAE
    this.channelEnabled = false;
    this.mapID = {{=cam.id}};
    
    // Database stuff
    this.db_methodPath = '/empathica/cam/call/json/';
    // Methods

    // Min and max values for node and edge valence values
    this.minValence = -1;
    this.neutralValence = 0;
    this.maxValence = 1;
    this.defaultValence = 0;

    // Shapes
    this.RECT = "rectangle";
    this.OVAL = "oval";
    this.HEX = "hexagon";

    /*
        Illustration of hexOffset. It determines the proportion of the 
        hexagon's width on either side of the centre before it begins 
        tapering. 
        
        Note: this is a default value defined for now - each node will have 
        its own hexOffest field in node.format that will be set depending on 
        the size of the contained text. 
       _________________
      /                 \
     /   w/2*p           \
    /  |<----->|          \
    \                     /
     \                   /
      \_________________/
    */
    this.hexOffset = 0.6; 
    
    // Colour scheme for the graph
    this.theme = THEMES.DEFAULT;
    
    // Node colours
    this.greenLine = "rgba(0,255,0,255)";
    this.greenFill = "rgba(215,255,215,255)";
    this.redLine = "rgba(255,0,0,255)";
    this.redFill = "rgba(255,215,215,255)";
    this.yellowLine = "rgba(255,255,0,255)";
    this.yellowFill = "rgba(255,255,215,255)";
    this.fontColour = "rgba(0,0,0,255)";
    
    // For highlighting nodes
    this.lowColour = 200;
    this.highColour = 245;
    
    // Node outline size
    this.nodeOutlineWidth = 2;
    this.nodeOutlineVariance = 4;

    // Edges
    this.edgeColour = "rgba(1,1,1,255)";
    this.edgeWidth = 1.5;
    this.edgeVariance = 2.0;
    this.edgeLineCap = "square";
    this.dashedPattern = new Array(2,10); // Used to determine line/blank interval. See canvasExtension.js
    this.edgePadding = 12;   // pixels on either side of an edge to be used for edge picking
    this.edgeShadowBlur = 5;
    this.edgePositiveShadowColour = "rgba(0, 240, 0, 255)";
    this.edgeNegativeShadowColour = "rgba(240, 0, 0, 255)";
    this.newEdgeColour = "rgba(128,128,128,255)";
    this.newEdgeWidth = 1.5;
    
    // Complex edges
    this.pointArray = new Array();

    // Canvas default
    this.blankGraph = "rgba(0,0,0,0)";

    // Selection handles
    this.handleTL = "handleTL";
    this.handleTR = "handleTR";
    this.handleBL = "handleBL";
    this.handleBR = "handleBR";
    this.handleSize = 10;

    // Text
    this.fontSize = 14;
    this.fontVariance = 10;
    this.fontLineHeight = 20;
    this.fontStyle = "sans-serif";
    this.textAlign = "center";
    this.textBaseline = "top";
    this.strongThreshold = 0.8;  // if Math.abs(node.valence) exceeds this threshold make the text bold
    this.textWidthInNode = 0.6;  // How much of the width of a node can be occupied by text (on auto-resize)
    this.textHeightInNode = 0.8; // How much of the height of a node can be occupied by text (on auto-resize)
    this.nodeWidthIncrease = 1.8; // Interval by which a node gets wider on auto-resize

    // Comments
    this.commentFill = "rgba(200,200,200,255)";
    this.commentOutline = "rgba(128,128,128,255)";
    this.commentEdgeStyle = "rgba(128,128,128,255)";
    this.commentEdgeWidth = 1.0;
    this.commentEdgePattern = new Array(2, 2);
    
    // Mouse event flags
    this.mouseDown = false;
    this.prevX = 0;
    this.prevY = 0;
    this.resizingDirection = "";
    this.resizedOrMoved = false;
    this.oldDim = {};
    this.totalX = 0;
    this.totalY = 0;
    this.mouseOverObject = {};
    this.brightTimer = -1;          // Timer used to highlight node on mouseover
    this.darkTimer = -1;            // Timer used to return highlighted node to normal state
    this.timerSpeed = 40;
    this.lightChange = 5;
    
    // Graph selection handling
    this.selectedObject = new Object();
    this.selection = [];
    this.hoverObject = new Object();
    this.possibleDeselect = new Object();   // This is used if there are multiple nodes selected and the 
                                            // the user (while holding shift) clicks on one of the nodes in 
                                            // order to drag the selected set. Unless the motion includes a drag
                                            // the "possibleDeselect" node is deselected on mouse-up
    
    // Interaction modes
    this.draggingNode = "draggingNode";     // a node has been selected
    this.draggingGraph = "draggingGraph";   // draggingGraph is the default interaction mode
                                            // that allows dragging and selection
    this.resizingNode = "resizingNode";
    this.pickedEdge = "pickedEdge";
    this.renamingNode = "renamingNode";
    this.multiSelect = "multiSelect";
    this.interactionMode = this.draggingGraph;

    // Canvas outline
    this.outlineCanvas = false;
    this.canvasOutlineColour = "rgba(0,0,0,255)";

    // Selection constants
    this.notANode = "notANode";
    this.notAnEdge = "notAnEdge";
    this.handle = "handle";
    this.nothingSelected = "nothingSelected";
    
    // Edge addition state machine
    this.addingEdgeFromNode = new Object();
    this.addingEdgeAddedZero = "addingEdgeZero";
    this.addingEdgeAddedOne = "addingEdgeOne";
    this.allowComplexEdge = true;       // Set this to false to disallow the creation of multi-point edges

    // UI Input mode state machine - defines Graph behaviour based on UI settings
    this.stateAddingNodes = "stateAddingNodes";
    this.stateAddingEdges = "stateAddingEdges";
    this.stateAddingComments = "stateAddingEdges";
    this.stateDefault = "stateDefault";
    
    this.inputModeState = this.stateDefault;        // current graph state
    
    // Data structures to keep track of the nodes and edges
    this.nodes = {};
    this.drawOrder = new Array();
    this.edges = {};
    
    // Undo / redo
    this.undoStack = new Array();
    this.redoStack = new Array();
    this.undoStackSize = 30;
    // Types
    this.cmdEdge = "cmdEdge";
    this.cmdNode = "cmdNode";
    this.cmdMulti = "cmdMulti";
    // Modified "properties"
    this.cmdNodePlaceholder = "cmdNodePlaceholder"; // earliest occurrence of node in undo stack
    this.cmdAddDB = "cmdAddDB";
    this.cmdDeleteDB = "cmdDeleteDB";
    this.cmdValence = "cmdValence";
    this.cmdText = "cmdText";
    this.cmdDim = "cmdDim";
    this.cmdLayout = "cmdLayout";
    this.cmdGraphMove = "cmdGraphMove";
    this.cmdInnerPoints = "cmdInnerPoints";
    this.cmdDragGraph = "cmdDragGraph";
    this.cmdAddSuggested = "cmdAddSuggested";
    
    // Saving
    this.pendingSaves = 0;
    this.redirectOnSave = "";
    this.savingError = false;
    
    // Zoom
    this.zoomScale = 1;
    this.originX = 0;
    this.originY = 0;
    
    // Error codes
    this.NODEID_INVALID         = 0x80080000;
    this.VALENCE_OUT_OF_RANGE   = 0x80080001;
    
    this.initEventListeners();
    
    // UI elements
    $('#textEditDiv').hide();
    var sliderOptions = {
        max: 7,
        min: 1,
        value: 4, 
        slide: this.valenceSlide,
        start: this.sliderStart,
        stop: this.sliderStop
    };
    $('#valenceInput').slider(sliderOptions);
    $('#valenceInput').css('width', 100);
    $('#valenceInput').css('height', 10);
    
    this.valenceOld = 0;
    
    this.hideValenceSelector();
    
    g = this;
}

/*
    Method to set state from the UI interface above the graph
    Available states: 
    this.stateAddingNodes
    this.stateAddingEdges
    this.stateAddingComments
    this.stateDefault
    
    this.inputModeState = this.stateDefault;        // current graph state
 */
Graph.prototype.setStateFromUI = function(newState) {
    if (this.stateAddingNodes != newState && this.stateAddingEdges != newState 
        && this.stateAddingComments != newState && this.stateDefault != newState) {
        debugOut('Attempting to set unknown state: ' + newState);
        return false;
    }

    // Stuff that should always happen
    this.clearSelection();
    this.deselect();
    
    this.repaint();
    
    // Let cursor be handled by the toolbar
    if (newState == this.stateDefault) {
    } else if (newState == this.stateAddingNodes) {
    } else if (newState == this.stateAddingEdges) {
        this.interactionMode = this.addingEdgeAddedZero;
    }
    
    this.inputModeState = newState;
    return true;
}

// Event handler for valence slider
Graph.prototype.valenceSlide = function(e, ui) {
    var newVal = ui.value;
    if (g.selectedObject instanceof Node) {
        g.setNodeValence(g.selectedObject.id, g.normalize(newVal));
    } else if (g.selectedObject instanceof Edge) {
        g.setEdgeValence(g.selectedObject.id, g.normalize(newVal));
    } else {
        debugOut(g.selectedObject);
    }
}

// Record old valence at the beginning of slide action
Graph.prototype.sliderStart = function(e, ui) {
    if (g.selectedObject instanceof Node || g.selectedObject instanceof Edge) {
        g.valenceOld = g.selectedObject.valence;
    }
}

// Record valence change once slider is dropped
Graph.prototype.sliderStop = function(e, ui) {
    // undo 
    if (g.selectedObject instanceof Node) {
        g.pushToUndo(new Command(g.cmdNode, g.selectedObject.id, g.cmdValence, g.valenceOld, g.selectedObject.valence));
    } else if (g.selectedObject instanceof Edge) {
        g.pushToUndo(new Command(g.cmdEdge, g.selectedObject.id, g.cmdValence, g.valenceOld, g.selectedObject.valence));
    }
}

// Set the position of the valence slider based on node position
Graph.prototype.positionSlider = function(node) {
    if (!(node instanceof Node)) {
        return false;
    } 
    $('#valenceDiv').css('left', node.dim.x - 50);
    $('#valenceDiv').css('top', node.dim.y + node.dim.height/2 + 10);
    
}

// Concept nodes
function Node (text, nodeValence) {
    this.text = text;
    this.valence = nodeValence;
    this.newNode = true;
}

// Add a node from the suggestion list
Graph.prototype.suggestedNode = function( id, nodeText, nodeValence, x, y) {
    var n = new Node(nodeText, nodeValence);
    n.id = id;
    n.dim = {};
    this.setPosition(n, x, y);
    
    this.nodes[n.id] = n;
    this.drawOrder.push(n.id);
    this.setSizeByText(this.ctx, n, true);
    
    this.pushToUndo(new Command(this.cmdNode, n.id, this.cmdAddSuggested, "", n));
    g.db_addNode(n);
    
    this.repaint();
} 

// Node added through UI
Graph.prototype.addNode = function( nodeText, nodeValence, x, y ) {
    if (nodeValence < this.minValence || nodeValence > this.maxValence) {
        return this.VALENCE_OUT_OF_RANGE;
    } 
    
    var n = new Node(nodeText, nodeValence);
    
    // Make call to DB to get the real new ID later
    n.id = guid();
    
    n.dim = {};
    
    this.pushToUndo(new Command(this.cmdNode, n.id, this.cmdNodePlaceholder, "", n.id));
    
    this.setPosition(n, x, y);
    
    this.nodes[n.id] = n;
    this.drawOrder.push(n.id);
    
    // HTML5 canvas elements
    var canvas = this.canvas;
    var ctx = this.ctx;
    this.setSizeByText(ctx, n, true);
    
    this.repaint();
    
    return n;
}

// Connections!
function Edge(id1, id2, v) {
    this.from = id1;
    this.to = id2;
    this.valence = v;
    this.innerPoints = new Array();
    this.complex = false;
}

function Point(x,y) {
    this.x = x;
    this.y = y;
}

// Edge added through UI
Graph.prototype.addEdge = function( id1, id2, v, inPts) {
    // Verify that the nodes exist
    if (typeof(this.nodes[id1]) == "undefined" || typeof(this.nodes[id2]) == "undefined") {
        return this.NODEID_INVALID;
    } else if (v < this.minValence || v > this.maxValence) {
        return this.VALENCE_OUT_OF_RANGE;
    }
    
    var e = new Edge(id1, id2, v);
    e.id = guid();
    
    if (inPts) { // exists and true
        // add points to complex edge
        e.innerPoints = inPts;
        e.complex = true;
    }
    
    this.pushToUndo(new Command(this.cmdEdge, e.id, this.cmdNodePlaceholder, "", e.id));
    
    e.from = id1;
    e.to = id2;
    e.valence = v;
    e.selected = false;
    e.newEdge = true;
    this.edges[e.id] = e;
    
    this.db_addEdge(e);
    this.pushToUndo(new Command(this.cmdEdge, e.id, this.cmdAddDB, "", e.id));
}

/*
    Mutators for nodes and edges
*/
Graph.prototype.setNodeText = function(id, newText) {
    var node = this.nodes[id];
    if (typeof(node) == "undefined") {
        return this.NODEID_INVALID;
    }
    var oldText = node.text;
    node.text = newText;
    
    this.pushToUndo(new Command(this.cmdNode, id, this.cmdText, oldText, node.text));
    
    this.repaint();
}

Graph.prototype.setNodeValence = function(id, newValence) {
    var node = this.nodes[id];
    if (typeof(node) == "undefined") {
        return NODEID_INVALID;
    }
    if (newValence < this.minValence || newValence > this.maxValence) {
        return this.VALENCE_OUT_OF_RANGE;
    }

    var oldValence = node.valence;
    node.valence = newValence;
    
    this.repaint();
}

Graph.prototype.deleteNode = function(id) {
    var node = this.nodes[id];
    if (!(node instanceof Node)) {
        return this.NODEID_INVALID;
    }
    
    var deletingNewNode = node.newNode;
    
    if (this.selectedObject.id == node.id) {
        this.selectedObject = new Object();
    }
    
    // Copy
    var dead = new Node(node.text, node.valence);
    dead.selected = node.selected;
    dead.newNode = node.newNode;
    dead.id = node.id;
    dead.dim = { 'x': node.dim.x, 'y': node.dim.y, 'width': node.dim.width, 'height': node.dim.height };
    
    // Remove the node from the drawOrder queue
    for(var i = 0; i < this.drawOrder.length; i++) {
        if (this.drawOrder[i] == node.id) {
            var ar1 = this.drawOrder.slice(0,i);
            var ar2 = this.drawOrder.slice(i+1,this.drawOrder.length);
            ar1 = ar1.concat(ar2);
            this.drawOrder = ar1;
            break;
        }
    }
    
    delete this.nodes[id];
    
    // Delete all edges touching this node
    for (var i in this.edges) {
        var edge = this.edges[i];
        if (edge.from == id || edge.to == id) {
            delete this.edges[edge.id];
        }
    }
    
    if (deletingNewNode) {
        // don't push a delete command because we haven't pushed an add yet. 
        // instead - delete everything from the undo stack containing this node's guid - it has not been committed yet
        this.removeFromUndoById(id);
    } else {
        this.pushToUndo(new Command(this.cmdNode, id, this.cmdDeleteDB, "", dead));
    }
    
    this.repaint();
}

Graph.prototype.setEdgeValence = function(id, newValence) {
    var edge = this.edges[id];
    if (typeof(edge.id) == "undefined") {
        return this.NODEID_INVALID;
    } else if (newValence < this.minValence || newValence > this.maxValence) {
        return this.VALENCE_OUT_OF_RANGE;
    }
    
    var oldValence = edge.valence;
    edge.valence = newValence;
    
    this.repaint();
}

Graph.prototype.deleteEdge = function(id) {
    var edge = this.edges[id];
    if (!(edge instanceof Edge )) {
        return;
    }
    
    var deletingNewEdge = edge.newEdge;
    
    var dead = new Edge(edge.from, edge.to, edge.valence);
    dead.selected = edge.selected;
    dead.newEdge = edge.newEdge;
    dead.id = edge.id;
    
    if (edge.selected) {
        this.selectedObject = {};
    }
    
    delete this.edges[id];
    
    if (deletingNewEdge) {
        this.removeFromUndoById(id);
    } else {
        this.pushToUndo(new Command(this.cmdEdge, id, this.cmdDeleteDB, "", dead));
    }
    
    this.repaint();
}

/* 
    Delete all nodes in the current selection (used with multi-select)
 */ 
Graph.prototype.deleteSelection = function () {
    for (var i in this.selection) {
        var x = this.selection[i];
        if (x instanceof Edge) {
            this.deleteEdge(x.id);
        } else if (x instanceof Node) {
            // Delete all edges connected to this node first
            for (var e in this.edges) {
                if (this.edges[e].to == x.id || this.edges[e].from == x.id) {
                    this.deleteEdge(e);
                }
            }
            
            this.deleteNode(x.id);
        }
    }
}

// Reposition a node in the graph
Graph.prototype.setPosition = function(n, x, y) {
    var oldDim = n.dim;
    if (x && y) {
        n.dim.x = x;
        n.dim.y = y;
    } else {    
        var canvas = document.getElementById(this.canvasName);
        n.dim.x = n.dim.width/2 + Math.random() * (canvas.width - 10 - n.dim.width);
        n.dim.y = n.dim.height/2 + Math.random() * (canvas.height - 10 - n.dim.height);
    }
    
    this.pushToUndo(new Command(this.cmdNode, n.id, this.cmdDim, oldDim, n.dim));
}

// Set the size of a node based on the text it contains
Graph.prototype.setSizeByText = function(ctx, node, push) {
    if (!(node instanceof Node)) {
        return;
    }
    if (node.text == null) {
        return;
    }
    
    var oldDim = node.dim;
    
    // reset node width and height
    node.dim.width = 100;
    node.dim.height = 60;
    
    var textWidth = ctx.measureText(node.text).width;
    
    var nodeWidth = node.dim.width * this.textWidthInNode; 
    
    var fits = false;
    // if text already fits in node, return
    if (textWidth <= nodeWidth) {
        return;
    }
    
    // continue resizing node until it fits
    var lineArray = new Array();
    
    // increase width first, then height
    var increaseWidth = true;
    var maxHeight = 0;
    var count = 0;
    while (!fits && count < 10) {
        count++;
        lineArray = this.getTextLines(ctx, node);
        
        var textWidth = this.lengthOfLongestLine(ctx, lineArray);
        //debugOut("textWidth = " + textWidth);
        
        // getTextLines fits text to width, so now check height
        // the total height (in pixels) of the node that is allowed to be occupied by text
        maxHeight = node.dim.height * this.textHeightInNode;
        
        // Break if line fits height AND width wise
        if (maxHeight >= lineArray.length * parseInt(this.theme.nodeFontLineHeight) && textWidth < node.dim.width * this.textWidthInNode) {
            break;
        }
        
        // Which direction to increase
        if (increaseWidth) {
            // increase width and see if it now fits height-wise
            node.dim.width *= this.nodeWidthIncrease;
        } else {
            // increase height and see if it now fits length-wise
            if (maxHeight < lineArray.length * parseInt(this.theme.nodeFontLineHeight)) {
                node.dim.height += parseInt(this.theme.nodeFontLineHeight);
            }
        }
        
        increaseWidth = !increaseWidth;
    }
    
    if (push) {
        this.pushToUndo(new Command(this.cmdNode, node.id, this.cmdDim, oldDim, node.dim));
    }
    
    return lineArray;
    
}

Graph.prototype.lengthOfLongestLine = function(ctx, lineArray) {
    var maxlen = 0;
    for (line in lineArray) {
        var len = ctx.measureText(lineArray[line]).width;
        if (len > maxlen) {
            maxlen = len;
        }
    }
    return maxlen;
}

Graph.prototype.getTextLines = function(ctx, node) {
    if (node.text == null) {
        return new Array();
    }
    var words = node.text.split(' ');
    var arr = new Array();
    var lineSoFar = "";
    
    var style = this.theme.nodeFontSize + ' ' + this.theme.nodeFontFamily;
    if (Math.abs(node.valence) > this.strongThreshold) {
        style = "bold " + style;
    }
    
    ctx.fontStyle = style;
    
    var length = node.dim.width * this.textWidthInNode;
    var lineWidth = 0;
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        lineWidth = ctx.measureText(lineSoFar + word).width;
        if (lineWidth < length) {
            lineSoFar += (" " + word);
        } else {
            arr.push(lineSoFar);
            lineSoFar = word;
        }
        if (i == words.length-1) {
            arr.push(lineSoFar);
            break;
        }
    }
    
    return arr;
}

// Get the object under the pointer
// Returns: resize handle, node, edge, or indication of nothing
Graph.prototype.getObjectUnderPointer = function(mx, my) {
    var pixColour = this.getPixelColour(this.ctx, mx, my);
        
    if (this.isClickOnHandle(pixColour)) {
        return this.handle;
    }
    
    var n = this.getNodeUnderPointer(mx, my);
    if (n instanceof Node) {
        return n;
    }
    
    var e = this.getEdgeUnderPointer(mx, my); 
    if (e instanceof Edge) {
        return e;
    }
    
    return this.nothingSelected;
}

// Figure out which node was clicked
Graph.prototype.getNodeUnderPointer = function(mx, my) {
    // Traverse the nodes in reverse draw order, so we get the top-most node first
    for (var i = this.drawOrder.length-1; i >= 0; i--) {
        var node = this.nodes[this.drawOrder[i]]; 
        // var coords = g.getCursorPosition(e);
        // var mx = coords[0];
        // var my = coords[1];
        if (this.clickInsideNode(mx, my, node)) {
            return node;
        }
    }
    return this.notANode;
}

// Figure out which edge was clicked
Graph.prototype.getEdgeUnderPointer = function(mx, my) {
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    for (var i in this.edges) {
        var edge = this.edges[i];
        
        var to = this.nodes[edge.to];
        var from = this.nodes[edge.from];
        
        // Create bounding box
        // ang should be the direction from 'from' to 'to'
        
        var pts = edge.innerPoints;
        // Add beginning and end to point array
        pts.unshift(new Point(from.dim.x, from.dim.y));
        pts.push(new Point(to.dim.x, to.dim.y));
        
        ctx.beginPath();
        
        // Move to first point
        var ang = Math.atan2(to.dim.y - from.dim.y, 
                             to.dim.x - from.dim.x);
        var perp = Math.PI/2 + ang;
        if (perp > Math.PI * 2) {
            perp -= Math.PI*2;
        }
        ctx.moveTo( from.dim.x + this.edgePadding * Math.cos(perp), 
                    from.dim.y + this.edgePadding * Math.sin(perp));
        
        for (var count = 0; count < 2; count++) {
            for (var i = 0; i < pts.length-1; i++) {
                
                var f = pts[i];
                var t = pts[i+1];
                ang = Math.atan2(t.y - f.y, 
                                     t.x - f.x);
                perp = Math.PI/2 + ang;
                if (perp > Math.PI * 2) {
                    perp -= Math.PI*2;
                }
                
                ctx.lineTo( f.x + this.edgePadding * Math.cos(perp), 
                            f.y + this.edgePadding * Math.sin(perp));
                // Draw line on first side
                ctx.lineTo( t.x + this.edgePadding * Math.cos(perp), 
                            t.y + this.edgePadding * Math.sin(perp));
            }
            // Draw connecting edge on end side
            if (count == 0) {
                ctx.lineTo( t.x - this.edgePadding * Math.cos(-1*perp), 
                            t.y + this.edgePadding * Math.sin(-1*perp));
            }
            pts.reverse();
        }
        
        ctx.lineTo( from.dim.x - this.edgePadding * Math.cos(-1*perp),
                    from.dim.y + this.edgePadding * Math.sin(-1*perp));
        
        /*
        ctx.moveTo( from.dim.x + this.edgePadding * Math.cos(perp), 
                    from.dim.y + this.edgePadding * Math.sin(perp));
        // long edge 1
        ctx.lineTo( to.x + this.edgePadding * Math.cos(perp), 
                    to.y + this.edgePadding * Math.sin(perp));
        
        ctx.lineTo( to.x - this.edgePadding * Math.cos(-1*perp), 
                    to.y + this.edgePadding * Math.sin(-1*perp));
        ctx.lineTo( from.x - this.edgePadding * Math.cos(-1*perp),
                    from.y + this.edgePadding * Math.sin(-1*perp));
        */
        
        ctx.closePath();
        
        //ctx.strokeStyle = "red";
        //ctx.stroke();
        
        // get rid of those points
        pts.shift();
        pts.pop();
        
        //if (ctx.isPointInPath(e.pageX, e.pageY)) {
        if (ctx.isPointInPath(mx, my)) {
            return edge;
        }

    }
    
    return this.notAnEdge;
}

Graph.prototype.clickInsideNode = function(x, y, node) {
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    if (node.valence == this.neutralValence) {
        this.drawRect(ctx, node);
    } else if (node.valence > this.neutralValence) {
        this.drawOval(ctx, node);
    } else {
        this.drawHex(ctx, node);
    }
    return ctx.isPointInPath(x, y);
}

Graph.prototype.getPixelColour = function(ctx, x, y) {
    var imgData = ctx.getImageData(x,y, 1, 1);
    var pix = imgData.data;

    // Construct colour code for the clicked pixel
    var pixColour = "rgba(" + pix[0];
    for (var i = 1; i < pix.length; i++) {
        pixColour += "," + pix[i];
    }
    pixColour += ")";
    
    return pixColour;
}

Graph.prototype.isClickOnHandle = function(pixColour) {
    if (pixColour == this.theme.nodeSelectionHandles) {
        return true;
    } else { 
        return false;
    }
    /*if (pixColour == this.handleTL || pixColour == this.handleTR || 
        pixColour == this.handleBL || pixColour == this.handleBR) {
        return true;
    } else {
        return false;
    }*/
}

Graph.prototype.whichHandle = function(node, mx, my) {
    if (mx < node.dim.x && my < node.dim.y) {
        return this.handleTL;
    } else if (mx < node.dim.x && my > node.dim.y) {
        return this.handleBL;
    } else if (mx > node.dim.x && my < node.dim.y) {
        return this.handleTR;
    } else if (mx > node.dim.x && my > node.dim.y) {
        return this.handleBR;
    }
}

// TODO
Graph.prototype.nodeFadeIn = function(node) {
    // HTML5 canvas elements
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    //var shade = 
}

Graph.prototype.zoomIn = function() {
    // HTML5 canvas elements
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    var zoom = 1.5;
    
    
}

Graph.prototype.zoomOut = function() {
    // HTML5 canvas elements
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    ctx.save();
    ctx.scale(0.5,0.5);
    ctx.restore();
    this.repaint();
    debugOut("zoomed out");
}

Graph.prototype.showTextEditor = function(node) {
    $('#textEditDiv').css('position', 'absolute');
    $('#textEditDiv').css('top', node.dim.y - node.dim.height/2);
    $('#textEditDiv').fadeIn(100, function() {
        $('#textEditInput').focus();
    });
    $('#textEditInput').val(node.text);
    var width = parseInt($('#textEditInput').css('width'), 10);
    $('#textEditDiv').css('left', node.dim.x - width/2);
    //setTimeout(function(){ $('#textEditInput').focus(); }, 1); // HACK!
}

Graph.prototype.hideTextEditor = function() {
    $('#textEditDiv').hide('fast');
    $('#cam').focus();
}

Graph.prototype.showValenceSelector = function(node, mx, my) {
    $('#valenceDiv').css('position', 'absolute');
    if (node instanceof Node) {
        $('#valenceDiv').css('left', node.dim.x - 50);
        $('#valenceDiv').css('top', node.dim.y + node.dim.height/2 + 10);
    } else if (node instanceof Edge) {
        var edge = node;
        // Determine midpoint of nodes
        var from = this.nodes[edge.from];
        var to = this.nodes[edge.to];
        if (mx && my) {
            $('#valenceDiv').css('left', mx - 50);
            $('#valenceDiv').css('top', my + 15);
        } else {
            var midx = (from.dim.x + to.dim.x)/2;
            var midy = (from.dim.y + to.dim.y)/2;
            $('#valenceDiv').css('left', midx - 50);
            $('#valenceDiv').css('top', midy + 15);
        }
    }
    $('#valenceDiv').show();
    
    $('#valenceInput').slider("option", "value", this.deNormalize(node.valence));
    
    //$('#textEditInput').focus();
}

Graph.prototype.normalize = function(val) {
    var x = val - 1; // from 1-7 to 0-6
    x = (x / 6) * 2; // from 0-6 to 0-2
    x -= 1; 
    return x;
}

Graph.prototype.deNormalize = function(val) {
    var x = val; // -1 to 1
    val += 1; // 0 to 2
    val *= 3; // 0 to 6
    val = Math.round(val);
    return val + 1; // 1 to 7
}

Graph.prototype.hideValenceSelector = function() {
    $('#valenceDiv').hide();
    //$('#cam').focus();
}

// Correct cursor position
Graph.prototype.getCursorPosition = function(e) {
    var canvas = document.getElementById(g.canvasName);
    var ctx = canvas.getContext("2d");
    
    var x;
    var y;
    
    if (e.pageX && e.pageY) {
        x = e.pageX; 
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop; 
    
    var ar = new Array(x, y);
    return ar;
}

/* 
    Select an object: set as selectedObject or add to multi-select array
    If replaceSelection is true, obj becomes the selectedObject and everything else is cleared    
 */
Graph.prototype.select = function(obj, replaceSelection) {
    if (! (obj instanceof Node) && !(obj instanceof Edge) ) {
        return;
    }

    if (obj instanceof Node && obj.selected) {
        return;
    } else if (this.selectedObject instanceof Edge && this.selectedObject != obj) {
        this.deselect();
    } else if ( (obj instanceof Edge || obj == this.nothingSelected ) && 
                (this.interactionMode == this.multiSelect || this.selectedObject instanceof Node) ) {
        this.deselect();
    }
    
    if (replaceSelection) {
        if (this.selection.length > 0) {
            this.deselect();
        }
        
        this.selectedObject.selected = false;
        
        this.selectedObject = obj;
        obj.selected = true;
        if (obj instanceof Node) {
            this.interactionMode = this.draggingNode;
        } else {
            this.interactionMode = this.pickedEdge;
        }
        
    } else {
        // Holding shift/ctrl -> add to selection
        if (this.selectedObject instanceof Node) {
            if (obj == this.selectedObject) {
                // No change
                return;
            }
            this.selection.push(this.selectedObject);
            obj.selected = true;
            this.selection.push(obj);
            this.selectedObject = {};
            this.interactionMode = this.multiSelect;
        } else if (this.selection.length == 0) {
            this.selectedObject = obj;
            obj.selected = true;
            if (obj instanceof Node) {
                this.interactionMode = this.draggingNode;
            } else {
                this.interactionMode = this.pickedEdge;
            }
        } else {
            obj.selected = true;
            this.selection.push(obj);
            this.interactionMode = this.multiSelect;
        }
    }
}

/*
    Remove the provided object from the selection array, or 
    clear whole selection. 
    
    obj - node or edge to remove (array cleared if obj not provided)
 */
Graph.prototype.deselect = function(obj) {
    if (obj) {
        
        if (this.interactionMode == this.multiSelect) {
            obj.selected = false;
            for (var i in g.selection) {
                if (this.selection[i] == obj) {
                    this.selection.splice(i,1);
                    break;
                }
            }
            
            if (this.selection.length == 1) {
                this.selectedObject = this.selection[0];
                this.interactionMode = this.draggingNode;
            }
        } else {
            obj.selected = false;
            this.selectedObject = {};
            this.interactionMode = this.draggingGraph;
        }
    } else {
        for (var i in g.selection) {
            this.selection[i].selected = false;
        }
        this.selection = [];
        this.selectedObject.selected = false;
        this.selectedObject = {};
        this.interactionMode = this.draggingGraph;
    }
}

// If a node or edge has been selected, deselect it
Graph.prototype.clearSelection = function() {
    if (this.selectedObject instanceof Node) {
        this.selectedObject.selected = false;
        //this.selectedObject.highLight = g.lowColour;
        this.selectedObject = new Object();
    } 
    if (this.selectedObject instanceof Edge) {
        this.selectedObject.selected = false;
        this.selectedObject = new Object();
    }
    
    this.addingEdgeFromNode = new Object();
    
    this.interactionMode = this.draggingGraph;
    
    this.hideValenceSelector();
    this.hideTextEditor();
    
    this.repaint();
}

// Update the selection to the provided object
Graph.prototype.setSelection = function(newObject) {
    if (this.selectedObject instanceof Edge) {
        this.selectedObject.selected = false;
        this.selectedObject = new Object();
    }
    if (this.selectedObject instanceof Node) {
        this.selectedObject.selected = false;
        this.selectedObject = new Object();
    }
    
    newObject.selected = true;
    this.selectedObject = newObject;
    
    this.interactionMode = this.draggingNode;
}

Graph.prototype.repaint = function(node) {
    if (node instanceof Node) {
        //.this.ctx.clearRect(node.dim.x - node.dim.width/2, node.dim.y - node.dim.height/2,
        //                   node.dim.width, node.dim.heigt);
        
        this.ctx.save();
        if (node.valence < this.neutralValence) {
            this.drawHex(this.ctx, node);
        } else if (node.valence > this.neutralValence) {
            this.drawOval(this.ctx, node);
        } else { 
            this.drawRect(this.ctx, node);
        }
        this.ctx.clip();
        
        this.drawNode(this.ctx, node);
        
        this.ctx.restore();
        
        /*for (var i in this.edges) {
            var e = this.edges[i];
            if (e.from == node.id || e.to == node.id) {
                this.drawEdge(this.ctx, e);
            }
        }*/
        
        //this.drawNode(this.ctx, node);
        
        return;
    }
    // HTML5 canvas elements
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    // Clear
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    this.draw();
}

/*
    For recovery purposes: creates a string representation of the graph
    The string can then be fed back into the Graph to reconstruct nodes and edges 
 */
Graph.prototype.createSaveString = function() {
    var save = {};
    save.nodes = {};
    save.edges = {};
    for (var i in this.nodes) {
        save.nodes[i] = this.nodes[i];
    }
    
    for (var i in this.edges) {
        save.edges[i] = this.edges[i];
    }
    
    var saveString = JSON.stringify(save);
    
    return saveString;
}

// Recreates the graph
Graph.prototype.generateGraphFromString = function(saveText) {
    var save = JSON.parse(saveText);
    this.nodes = save.nodes;
    this.edges = save.edges;
}