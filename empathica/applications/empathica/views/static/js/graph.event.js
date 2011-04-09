
// Keyboard keyCodes
var KEY = {
    ENTER:          13,
    ESCAPE:         27,
    DELETE:         46,
    BACKSPACE:      8,
    UNDO:           90, // Z
    ADD_NODES:      78, // A
    ADD_EDGES:      69, // E
    SAVE:           83, // S
    CTRL:           17,
    SHIFT:          16,
    ALT:            18,
    RESTORE:        84
};

Graph.prototype.initEventListeners = function() {
    // HTML5 canvas elements
    var canvas = document.getElementById(this.canvasName);
    var ctx = canvas.getContext("2d");
    
    {{ if settings.web2py_runtime_gae: }}
    // Set up the google app engine socket
    this.channel = new goog.appengine.Channel("{{=channel_token}}");
    this.socket = this.channel.open();
    this.socket.onopen = this.socketOnOpened;
    this.socket.onmessage = this.socketOnMessage;
    this.socket.onerror = this.socketOnError;
    this.socket.onclose = this.socketOnClose;
    {{ pass }}
    
    // Would be nice but fails in Firefox 3.6 right now
    // var emd = this.eventMouseDown.bind(this);
    // canvas.addEventListener("mousedown", emd, false);
    
    // var emu = this.eventMouseUp.bind(this);
    // canvas.addEventListener("mouseup", emu, false);
    
    // var emm = this.eventMouseMove.bind(this);
    // canvas.addEventListener("mousemove", emm, false);
    
    // var emc = this.eventMouseClick.bind(this);
    // canvas.addEventListener("click", emc, false);
    
    // Add the canvas and context to the graph's properties
    this.canvas = canvas;
    this.ctx = ctx;
    
    canvas.addEventListener("mousedown", this.eventMouseDown, false);

    canvas.addEventListener("mouseup", this.eventMouseUp, false);
    
    canvas.addEventListener("mousemove", this.eventMouseMove, false);
    
    canvas.addEventListener("dblclick", this.eventMouseDoubleClick, false);
    
    canvas.addEventListener("mousewheel", this.eventMouseWheel, false); 
    canvas.addEventListener("DOMMouseScroll", this.eventMouseWheel, false); 
    
    window.addEventListener("keydown", this.eventKeyDown, false); 
    
    var textEditor = document.getElementById('textEditInput');
    textEditor.onkeydown = this.nodeRenameHandler;
    textEditor.onenter = function() {return false;};
    document.onkeypress = stopRKey;     // Disable submittal of forms on enter.
    
    // Disable 
    document.onkeydown = function (e) { 
        e = e||window.event; 
        var c = e.keyCode||e.which; 
        if (c == KEY.BACKSPACE && g.interactionMode != g.renamingNode) { 
            return false;
        }
        if (e.ctrlKey && c == KEY.SAVE) {
            g.saveGraph();
            $.blockUI({
                message: "Saving. Just a moment... ",
            });
            return false;
        }
    }
    
    document.oncontextmenu = function() {
        return false;
    };
    
    //this.inputModeState = this.stateDefault;
    
    // $('body').focus(function() {
        // if (g.interactionMode == g.renamingNode) {
            //textEditInput').focus();
        // }
    // });
}

/*
    Mac del key: 8
 */

Graph.prototype.eventKeyDown = function(e) {
    e = e || window.event;
    var code = e.keyCode || e.which;
    
    //debugOut(code);
    
    if (e.ctrlKey && KEY.UNDO == code) {   // Ctrl+ Z
        g.undo();
        return;
    } else if (e.ctrlKey && KEY.SAVE == code) {
        // saveGraph called by the document's keydown handler, set in initEventListeners
        return;
    }
    
    if (g.inputModeState == g.stateDefault) {
        
        // HOTKEYS
        /*if (13 == code || 27 == code) {   // enter
            return false;
        } */
        
        if (g.interactionMode != g.renamingNode) {
            if ( KEY.BACKSPACE == code ) {
                return false;
            }
            if ( KEY.ADD_NODES == code ) {              // N
                $('#btnAddConcepts').toolbarButton('toggle');
                return;
            } else if (KEY.ADD_EDGES == code ) {       // E
                $('#btnAddConnections').toolbarButton('toggle');
                return;
            } 
        }
        
        if (g.selectedObject instanceof Node) {
            if (KEY.DELETE == code && g.interactionMode != g.renamingNode) { // delete
                g.deleteNode(g.selectedObject.id);
                g.interactionMode = g.draggingGraph;
                g.hideValenceSelector();
            } else if (KEY.ESCAPE == code) {        // Escape
                $('#btnSelect').toolbarButton('toggle');
            } else if (KEY.ENTER == code || KEY.CTRL == code || KEY.SHIFT == code || KEY.ALT == code) {
                // NO-OP
            } else if (g.interactionMode != g.renamingNode) {
                g.interactionMode = g.renamingNode;
                g.showTextEditor(g.selectedObject);
            } 
        } else if (g.selectedObject instanceof Edge) {
            if (KEY.DELETE == code) {
                g.deleteEdge(g.selectedObject.id);
                g.interactionMode = g.draggingGraph;
                g.hideValenceSelector();
            } else if (KEY.ESCAPE == code) {        // Escape
                $('#btnSelect').toolbarButton('toggle');
                g.selectedObject = {};
            }
        } else if (g.interactionMode == g.multiSelect) {
            if (KEY.DELETE == code) {
                // Delete all
                g.deleteSelection();
            }
        }
    } else if (g.inputModeState == g.stateAddingNodes) {
    }
}

Graph.prototype.nodeRenameHandler = function(e) {
    e = e || window.event;

    // Validation
    if (! g.selectedObject instanceof Node) {
        return false;
    }
    
    var code;
        
    code = e.keyCode;
    if (!e) {
        code = e.which;
    } else {
    }
    
    if (KEY.ENTER == code) {           // Enter
        var text = $.trim($('#textEditInput').val());
        if (text == '') {
            g.hideTextEditor();
            if (g.selectedObject.newNode) {
                // Escaping out of first naming - delete node
                g.deleteNode(g.selectedObject.id);
            }
            $('#btnSelect').toolbarButton('toggle');
            return false;
        }
        g.setNodeText(g.selectedObject.id, text);
        g.hideTextEditor();
        g.setSizeByText(document.getElementById(g.canvasName).getContext('2d'), g.selectedObject);
        g.repaint();
        
        // Check if naming a new node for the first time
        if (g.selectedObject.newNode) {
            // If new node, then save it in the database
            g.pushToUndo(new Command(g.cmdNode, g.selectedObject.id, g.cmdAddDB, "", g.selectedObject.id));
            g.db_addNode(g.selectedObject);
        }
        
        var n = g.selectedObject;
        
        // Reset state to default
        //debugOut("canvas dif css and data");
        
        // TODO: toggle button appearance
        //g.setState(g.stateDefault);
        $('#btnSelect').toolbarButton('toggle');
        
        g.selectedObject = n;
        g.selectedObject.selected = true;
        //debugOut(n);
        
        g.repaint();
        
        g.showValenceSelector(g.selectedObject);
        g.positionSlider(g.selectedObject);
        g.interactionMode = g.draggingNode;
    } else if (KEY.ESCAPE == code) {    // Escape
        g.hideTextEditor();
        if (g.selectedObject.newNode) {
            // Escaping out of first naming - delete node
            g.deleteNode(g.selectedObject.id);
        } else {
            // Escaping out of simple renaming
            g.interactionMode = g.draggingNode;
        }
        $('#btnSelect').toolbarButton('toggle');
    } else {
        // Allow the widget to natively handle its own input
        return true;
    }
    return false;
}

// Handle mouse movements
Graph.prototype.eventMouseMove = function(e) {
    
    var coords = g.getCursorPosition(e);
    var mx = coords[0];
    var my = coords[1];
    
    if (g.inputModeState == g.stateDefault) {
        //var g = this;
        var canvas = document.getElementById(g.canvasName);
        var ctx = canvas.getContext("2d");
        
        // Only move shapes if the mouse is pressed
        if (g.mouseDown) {
            g.possibleDeselect = {};
            var xOffset = mx - g.prevX;
            var yOffset = my - g.prevY;
            if (g.interactionMode == g.renamingNode) {
                // ignore clicks on the graph while renaming node
                return;
            } else if (g.interactionMode == g.draggingNode) {
                // If there is a node currently selected, move it
                if (g.selectedObject instanceof Node) {
                    g.selectedObject.dim.x += xOffset;
                    g.selectedObject.dim.y += yOffset;
                    g.resizedOrMoved = true;
                } 
                g.positionSlider(g.selectedObject);
                //g.updateDivPosition(g.selectedObject);
            } else if (g.interactionMode == g.resizingNode) {
                if (typeof(g.selectedObject.id) == "undefined") {
                    debugOut("ERROR: Resizing a node which does not exist");
                    return;
                }
                var oldy = g.selectedObject.dim.y;
                var oldx = g.selectedObject.dim.x;
                var oldw = g.selectedObject.dim.width;
                var oldh = g.selectedObject.dim.height;
                
                // See which handle is being dragged
                if (g.resizingDirection == g.handleTL) {
                    // Dragging top left corner
                    if (!( (yOffset > 0) && (yOffset > oldh - 20) ) && 
                        !( (xOffset > 0) && (xOffset > oldw - 20) ) ) {                        
                        g.selectedObject.dim.y += yOffset/2;
                        g.selectedObject.dim.height -= yOffset;
                        g.selectedObject.dim.x += xOffset/2;
                        g.selectedObject.dim.width -= xOffset;
                    } else {
                        if (!g.isClickOnHandle(g.getPixelColour(ctx, mx, my))) {
                            g.resizingNode = false;
                        }
                    }
                } else if (g.resizingDirection == g.handleTR) {
                    // Dragging top right corner
                    if (!( (yOffset > 0) && (yOffset > oldh - 20) ) && 
                        !( (xOffset < 0) && (Math.abs(xOffset) > oldw - 20) ) ) {
                        g.selectedObject.dim.y += yOffset/2;
                        g.selectedObject.dim.height -= yOffset;
                        g.selectedObject.dim.x += xOffset/2;
                        g.selectedObject.dim.width += xOffset;
                    } else {
                        if (!g.isClickOnHandle(g.getPixelColour(ctx, mx, my))) {
                            g.resizingNode = false;
                        }
                    }
                } else if (g.resizingDirection == g.handleBL) {
                    // Dragging bottom left corner
                    if (!( (yOffset < 0) && (Math.abs(yOffset) > oldh - 20) ) && 
                        !( (xOffset > 0) && (xOffset > oldw - 20) ) ) {
                        g.selectedObject.dim.y += yOffset/2;
                        g.selectedObject.dim.height += yOffset;
                        g.selectedObject.dim.x += xOffset/2;
                        g.selectedObject.dim.width -= xOffset;
                    } else {
                        if (!g.isClickOnHandle(g.getPixelColour(ctx, mx, my))) {
                            g.resizingNode = false;
                        }
                    }
                } else if (g.resizingDirection == g.handleBR) {
                    // Dragging bottom right corner
                    if (!( (yOffset < 0) && (Math.abs(yOffset) > oldh - 20) ) && 
                        !( (xOffset < 0) && (Math.abs(xOffset) > oldw - 20) ) ) {
                        g.selectedObject.dim.y += yOffset/2;
                        g.selectedObject.dim.height += yOffset;
                        g.selectedObject.dim.x += xOffset/2;
                        g.selectedObject.dim.width += xOffset;
                    } else {
                        if (!g.isClickOnHandle(g.getPixelColour(ctx, mx, my))) {
                            g.resizingNode = false;
                        }
                    }
                }
                g.resizedOrMoved = true;
                g.positionSlider(g.selectedObject);
                
            } else if (g.interactionMode == g.draggingGraph) {
                for (i in g.nodes) {
                    var node = g.nodes[i];
                    node.dim.x += xOffset;
                    node.dim.y += yOffset;
                    //g.updateDivPosition(node);
                }
                // Update edge midpoints
                for (var e in g.edges) {
                    var edge = g.edges[e];
                    if (edge.innerPoints) {
                        for (var p = 0; p < edge.innerPoints.length; p++) {
                            edge.innerPoints[p].x += xOffset;
                            edge.innerPoints[p].y += yOffset;
                        }
                    }
                }
                
                g.totalX += xOffset;
                g.totalY += yOffset;
                
                if (Math.abs(xOffset) > 0 || Math.abs(yOffset) > 0) {
                    g.resizedOrMoved = true;
                }
                
            } else if (g.interactionMode == g.multiSelect) {
                for (var i in g.selection) {
                    if (g.selection[i] instanceof Node) {
                        g.selection[i].dim.x += xOffset;
                        g.selection[i].dim.y += yOffset;
                    } else if (g.selection[i] instanceof Edge) {
                        if (g.selection[i].innerPoints) {
                            for (var p = 0; p < edge.innerPoints.length; p++) {
                                g.selection[i].innerPoints[p].x += xOffset;
                                g.selection[i].innerPoints[p].y += yOffset;
                            }
                        }
                    }
                }
                
                g.totalX += xOffset;
                g.totalY += yOffset;
                if (Math.abs(xOffset) > 0 || Math.abs(yOffset) > 0) {
                    g.resizedOrMoved = true;
                }
            }
            g.prevX = mx;
            g.prevY = my;
            g.repaint();
        } else {
            g.mouseOverHandler(e);
            g.repaint();
        }
    } else if (g.inputModeState == g.stateAddingNodes) {
        g.mouseOverHandler(e);
    } else if (g.inputModeState == g.stateAddingEdges) {
        g.mouseOverHandler(e);
        
        // Show the semi drawn edge
        if (g.interactionMode == g.addingEdgeAddedOne) {
            g.repaint();
            var saveStyle = g.ctx.strokeStyle;
            var saveWidth = g.ctx.lineWidth;
            
            g.ctx.beginPath();
            g.ctx.strokeStyle = g.newEdgeColour;
            g.ctx.lineWidth = g.newEdgeWidth;
            g.ctx.moveTo(g.addingEdgeFromNode.dim.x, g.addingEdgeFromNode.dim.y);
            for (var i = 0; i < g.pointArray.length; i++) {
                g.ctx.lineTo(g.pointArray[i].x, g.pointArray[i].y);
            }
            g.ctx.lineTo(mx,my);
            g.ctx.stroke();
            
            g.ctx.strokeStyle = saveStyle;
            g.ctx.lineWidth = saveWidth;
        }
        
        g.repaint(g.addingEdgeFromNode);
        
    } else if (g.inputModeState == g.stateAddingComments) {
        //g.mouseOverHandler(e);
    }
}

Graph.prototype.mouseOverHandler = function(e) {
    var coords = g.getCursorPosition(e);
    var mx = coords[0];
    var my = coords[1];
    var newNode = g.getObjectUnderPointer(mx, my);
    if (newNode instanceof Node) {
        if (newNode.selected) {
            return;
        }
        // Mousing over node
        g.hoverObject = newNode;
    } else if (newNode instanceof Edge) {
        g.hoverObject = newNode;
    } else {
        g.hoverObject = {};
    }
}

Graph.prototype.eventMouseUp = function(e) {
    if (g.inputModeState == g.stateDefault) {
        
        if (g.possibleDeselect instanceof Node) {
            g.deselect(Node);
            g.hideValenceSelector();
            g.repaint();
        }
        
        //var g = this;
        var canvas = g.canvas;
        var ctx = g.ctx;
        g.mouseDown = false;
        
        // If we've moved or resized the selected node then record this
        if (g.resizedOrMoved == true) {
            if (g.interactionMode == g.multiSelect) {
                var nodeList = {};
                for (var i in g.selection) {
                    var n = g.selection[i];
                    nodeList[n.id] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
                }
                
                g.pushToUndo(new Command(g.cmdMulti, "", g.cmdLayout, "", nodeList));
                return;
            } else if (g.selectedObject instanceof Node) {
                var sn = g.selectedObject;
                if (g.oldDim.x != sn.x || g.oldDim.y != sn.y || g.oldDim.width != sn.width || g.oldDim.height != sn.height) {
                    g.pushToUndo(new Command(g.cmdNode, g.selectedObject.id, g.cmdDim, g.oldDim, g.selectedObject.dim));
                }
            } else {
                // Moved entire graph
                // TODO, possibly
                var nodeList = {};
                for (var i in g.nodes) {
                    var n = g.nodes[i];
                    nodeList[n.id] = {'x': n.dim.x, 'y': n.dim.y, 'width': n.dim.width, 'height': n.dim.height};
                }
                
                for (var i in g.edges) {
                    var e = g.edges[i];
                    
                }
                
                g.pushToUndo(new Command(g.cmdNode, "", g.cmdGraphMove, "", nodeList));
            }
        } else {
            if (g.interactionMode == g.multiSelect) {
                return;
            }
        }
        
        g.resizedOrMoved = false;
        g.totalX = 0;
        g.totalY = 0;
        g.oldDim = {};
        g.interactionMode = g.draggingNode;
    } else if (g.inputModeState == g.stateAddingNodes) {
        
    } else if (g.inputModeState == g.stateAddingEdges) {
    
    } else if (g.inputModeState == g.stateAddingComments) {
        
    }
    
}

Graph.prototype.eventMouseDown = function(e) {
    var coords = g.getCursorPosition(e);
    var mx = coords[0];
    var my = coords[1];
    
    if (g.inputModeState == g.stateDefault && e.button == 0) {
        // A click in renamingNode interaction mode submits
        if (g.interactionMode == g.renamingNode) {
            var text = $.trim($('#textEditInput').val());
            if (text == '') {
                g.hideTextEditor();
                if (g.selectedObject.newNode) {
                    // Escaping out of first naming - delete node
                    g.deleteNode(g.selectedObject.id);
                }
                $('#btnSelect').toolbarButton('toggle');
                return false;
            }
            g.setNodeText(g.selectedObject.id, text);
            g.hideTextEditor();
            g.setSizeByText(document.getElementById(g.canvasName).getContext('2d'), g.selectedObject);
            
            // Check if naming a new node for the first time
            if (g.selectedObject.newNode) {
                // If new node, then save it in the database
                g.pushToUndo(new Command(g.cmdNode, g.selectedObject.id, g.cmdAddDB, "", g.selectedObject.id));
                g.db_addNode(g.selectedObject);
            }
            
            $('#btnSelect').toolbarButton('toggle');
            
            g.repaint();
            
            return;
        }
        
        var canvas = g.canvas;
        var ctx = g.ctx;
        // Set previous coordinates and mouse down
        g.mouseDown = true;

        g.prevX = mx;
        g.prevY = my;
        
        // Node selection logic
        var oldNode = g.selectedObject;
        var newNode = g.getObjectUnderPointer(mx, my);
        
        var replace = true;
        var shiftPressed = false;
        // If Ctrl key pressed, don't replace, but *add* to selection
        if (e.ctrlKey || e.shiftKey) {
            replace = false;
            shiftPressed = true;
        }
        
        // Selection
        if (newNode instanceof Node) {
            if (newNode.selected) {
                if (newNode == g.selectedObject) {
                    
                } else if (shiftPressed) {
                    //g.deselect(newNode);
                    g.possibleDeselect = newNode;
                } else {
                    g.select(newNode, true);
                }
            } else {
                g.select(newNode, replace);
            }
        } else if (newNode instanceof Edge) {
            g.select(newNode, replace);
        } else if (newNode == g.handle) {
            if (g.interactionMode == g.multiSelect) {
            } else {
                newNode = g.getNodeUnderPointer(mx, my);
                if (!shiftPressed) {
                    g.select(newNode, replace);
                    g.interactionMode = g.resizingNode;
                    g.setOldDim(g.selectedObject.dim);
                } else {
                    // If holding shift/ctrl and click handle, ignore
                    g.setOldDim(newNode.dim);
                }
                g.resizingDirection = g.whichHandle(g.selectedObject, mx, my);
            }
        } else if (newNode == g.nothingSelected) {
            if (shiftPressed) {
                // probably a mis-click: don't clear selection
            } else {
                g.deselect();
            }   
        }
        
        // Effects of selection
        if (g.selectedObject instanceof Node) {
            g.setOldDim(g.selectedObject.dim);
            if (oldNode != g.selectedNode) {
                g.showValenceSelector(g.selectedObject);
                for(var i = 0; i < g.drawOrder.length; i++) {
                    if (g.drawOrder[i] == g.selectedObject.id) {
                        var ar1 = g.drawOrder.slice(0,i);
                        var ar2 = g.drawOrder.slice(i+1,g.drawOrder.length);
                        ar1 = ar1.concat(ar2);
                        ar1.push(g.drawOrder[i]);
                        g.drawOrder = ar1;
                        break;
                    }
                }
            }
        } else if (g.selectedObject instanceof Edge) {
            if (oldNode != g.selectedObject) {
                if (oldNode instanceof Node) {
                    
                }
            }
                g.showValenceSelector(g.selectedObject, mx, my);
        } else if (newNode == g.handle) {
            
        } else if (g.interactionMode == g.multiSelect || g.interactionMode == g.draggingGraph) {
            g.hideValenceSelector();
        }
        
        /*var pixColour = g.getPixelColour(ctx, mx, my);
        
        if (g.isClickOnHandle(pixColour)) {
            newNode = g.handle;
            g.resizingDirection = pixColour;
        }
        
        // Check what we have selected
        if (newNode == g.notANode) {
            // Clicked on graph or edge
            // First - deselect currently selected node if it exists
            if (g.selectedObject instanceof Node) {
                g.selectedObject.selected = false;
                g.selectedObject.highLight = g.lowColour;
                g.selectedObject = new Object();
                g.hideValenceSelector();
            }
            
            var clickedEdge = g.getEdgeUnderPointer(mx, my);
            if (clickedEdge == g.notAnEdge) {
                g.interactionMode = g.draggingGraph;
                g.selectedObject.selected = false;
                g.selectedObject.highLight = g.lowColour;
                g.selectedObject = new Object();
                g.hideValenceSelector();
            } else {
                g.interactionMode = g.pickedEdge;
                //debugOut("PICKED EDGE!!!!");
                
                if (typeof(g.selectedObject.id) != "undefined") {
                    g.selectedObject.selected = false;
                    g.hideValenceSelector();
                }
                clickedEdge.selected = true;
                g.selectedObject = clickedEdge;
                
                g.showValenceSelector(g.selectedObject, mx, my);
            }
            
            //g.interactionMode = g.draggingGraph;
        } else if (newNode == g.handle) {
            // Clicked on a selection handle
            g.interactionMode = g.resizingNode;
            //g.oldDim = g.selectedObject.dim;
            g.setOldDim(g.selectedObject.dim);
        } else {
            // We have selected a node!
            // Deselect edge first, if necessary 
            if (g.selectedObject instanceof Edge) {
                g.selectedObject.selected = false;
                g.selectedObject = new Object();
            }
            newNode.selected = true;
            newNode.highLight = g.highColour;
            g.selectedObject = newNode;
            g.setOldDim(g.selectedObject.dim);
            g.interactionMode = g.draggingNode;
            // Check if we have selected the already selected node
            if (oldNode != g.selectedObject && oldNode instanceof Node) {
                oldNode.selected = false;
                oldNode.highLight = g.lowColour;
                
                if (oldNode.id != g.selectedObject.id) {
                    g.hideValenceSelector();
                    g.showValenceSelector(g.selectedObject);
                } 
            } 
            // Push the new node to the front of the draw order
            for(var i = 0; i < g.drawOrder.length; i++) {
                if (g.drawOrder[i] == g.selectedObject.id) {
                    var ar1 = g.drawOrder.slice(0,i);
                    var ar2 = g.drawOrder.slice(i+1,g.drawOrder.length);
                    ar1 = ar1.concat(ar2);
                    ar1.push(g.drawOrder[i]);
                    g.drawOrder = ar1;
                    break;
                }
            }
            
            // Show the valence selector
            g.showValenceSelector(g.selectedObject);
            
        }
        */
        
        g.repaint();
    } else if (g.inputModeState == g.stateAddingNodes) {
        if (e.button == 2) {
            $('#btnSelect').toolbarButton('toggle');
            return;
        }
        var newNode = g.addNode("", g.defaultValence, mx, my);
        $('#btnSelect').toolbarButton('toggle');
        g.setSelection(newNode);
        g.interactionMode = g.renamingNode;
        g.showTextEditor(newNode);
    } else if (g.inputModeState == g.stateAddingEdges) {
        if (e.button == 2) {
            $("#btnSelect").toolbarButton('toggle');
            //g.setState(g.stateDefault);
            return;
        }
        var node = g.getNodeUnderPointer(mx, my);
        if (node == g.notANode) {
            // Check if its a complex edge and we've already added one node
            if (g.complexEdge && g.interactionMode == g.addingEdgeAddedOne) {
                g.pointArray.push(new Point(mx, my));
                debugOut('pushed point: ' + mx + ', ' + my);
            }
            return;
        }
        if (g.interactionMode == g.addingEdgeAddedZero) {
            g.addingEdgeFromNode = node;
            g.interactionMode = g.addingEdgeAddedOne;
        } else if (g.interactionMode == g.addingEdgeAddedOne) {
            // validate edge
            var edgeExists = false;
            for (var i in g.edges) {
                var e = g.edges[i];
                if (    (e.from == g.addingEdgeFromNode.id && e.to == node.id) ||
                        (e.from == node.id && e.to == g.addingEdgeFromNode.id) ) {
                    edgeExists = true;
                }
            }
            if (!edgeExists) {
                // add edge
                g.addEdge(g.addingEdgeFromNode.id, node.id, g.defaultValence, g.pointArray);
            }
            // reset midpoint array
            g.pointArray = [];
            // reset state
            g.addingEdgeFromNode = new Object();

            $("#btnSelect").toolbarButton('toggle');
            g.repaint();
        }
        
    } else if (g.inputModeState == g.stateAddingComments) {
        if (e.button == 2) {
            g.setState(g.stateDefault);
            return;
        }
    }
    
    
}

Graph.prototype.eventMouseDoubleClick = function(e) {
    if (g.inputModeState == g.stateDefault && e.button == 0) {
        if (g.selectedObject instanceof Node) {
            g.interactionMode = g.renamingNode;
            g.showTextEditor(g.selectedObject);
        }
    }
}

Graph.prototype.eventMouseWheel = function (e) {
    return true;
    //debugOut(e);
    var canvas = document.getElementById(g.canvasName);
    var ctx = canvas.getContext("2d");
    
    var coords = g.getCursorPosition(e);
    var mx = coords[0];
    var my = coords[1];
    
    var move = 0;
    if (e.wheelDelta) {
        // Chrome, IE
        move = e.wheelDelta/120;
    } else {
        // Firefox
        move = e.detail / -3;
    }
    
    var wheel = move;//n or -n
    
    debugOut('wheel ' + wheel);

    var zoom = 1 + wheel/2;
    
    debugOut('zoom ' + zoom);
    
    //ctx.translate(g.originX, g.originY);
    
    ctx.scale(zoom, zoom);
    /*ctx.translate(
        -( mx / g.ZoomScale + g.originX - mx / ( g.ZoomScale * zoom ) ),
        -( my / g.ZoomScale + g.originY - my / ( g.ZoomScale * zoom ) )
    );*/
    
    //g.originX = ( mx / g.ZoomScale + g.originX - mx / ( g.ZoomScale * zoom ) );
    //g.originY = ( my / g.ZoomScale + g.originY - my / ( g.ZoomScale * zoom ) );
    
    g.zoomScale *= zoom;
    
    debugOut('g.zoomScale ' + g.zoomScale);
    
    g.repaint();
}

Graph.prototype.setOldDim = function (dim) {
    var d = {};
    d.x = dim.x;
    d.y = dim.y;
    d.width = dim.width;
    d.height = dim.height;
    g.oldDim = d;
}

Graph.prototype.brightenObject = function (id) {
    g.nodes[id].highLight = g.nodes[id].highLight + g.lightChange;
    if (g.nodes[id].highLight > g.highColour) {
        g.nodes[id].highLight = g.highColour;
    }
    g.repaint(g.nodes[id]);
}

Graph.prototype.darkenObject = function (id) {
    g.nodes[id].highLight = g.nodes[id].highLight - g.lightChange;
    if (g.nodes[id].highLight < g.lowColour) {
        g.nodes[id].highLight = g.lowColour;
    }
    //g.repaint();
    g.repaint(g.nodes[id]);
}
