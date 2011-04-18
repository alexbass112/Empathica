/** 
    Database calls made by the Graph library. Calls are made using the 
    jQuery library. URLs for the AJAX calls are constructed for us by web2py. 
    
    In the case of a Database error (authentication or other unknown error)
    the library notes it. If this happens, the user will also be prompted with 
    the stringified JSON text of the graph that they can later use to recover 
    the graph in case of a DB crash (TODO). 
    
    In debug mode (set in graph.util.js) each call prints its URL to the 
    console before invoking the AJAX call. 
    
    Author:         Alex Bass
    Last Updated:   2011-04-17
 **/ 

// TODO: 
/*$.getJSON(
           "{{=URL('call/json/close_conflict')}}",
           {'id': id},
           function(data) {
               if (data.success) {
                   conflictItem.fadeOut(300, function() {
                       $(this).remove();
                   });
               } else {  }
               return false;
           }
       ).error(function(json) {});
*/

/**
    Add a node from the Node suggestion interface to this Graph's Map in the DB
**/
Graph.prototype.db_addSuggestedNode = function(node) {
    if (! (node instanceof Node) ) {
        return;
    }
    var url = "{{=URL('call/json/add_suggested_node')}}";
    debugOut(url);
    this.incrementPendingSaves();
    $.getJSON( 
        url, 
        {   
            map_id:             g.mapID,
            other_node_id:      node.id,    // token
            name:               node.text,
            x:                  node.dim.x,
            y:                  node.dim.y,
            width:              node.dim.width,
            height:             node.dim.height,
            valence:            node.valence
        }, function(data) {
            
            if (typeof(data.success) != "undefined") {
                if (data.success == true) {
                    debugOut('success true!');
                    var node = g.nodes[data.token];
                    node.newNode = false;
                    node.id = data.node_id;
                    g.nodes[data.node_id] = node;
                    delete g.nodes[data.token];
                    
                    // Draw order
                    for (var i = g.drawOrder.length - 1; i >= 0; i--) {
                        if (g.drawOrder[i] == data.token) {
                            g.drawOrder[i] = node.id;
                            break;
                        }
                    }
                    
                    // Undo stack
                    for (var j = g.undoStack.length - 1; j >= 0; j--) {
                        var cmd = g.undoStack[j];
                        if (cmd.objId == data.token) {
                            cmd.objId = node.id;
                            if (cmd.property == g.cmdNodePlaceholder) {
                                break; // placeholder should be earliest occurrence of this node
                            }
                        }
                        
                    }
                } else {
                    // Auth issue
                    g.savingError = true;
                }
            } else {
                // Success undefined
                g.savingError = true;
            }
            
            g.decrementPendingSaves();
        }).error(function(data) {
        g.decrementPendingSaves();
        g.savingError = true;
    });
}

/**
    Add a new node on the Graph to the DB
**/
Graph.prototype.db_addNode = function(node) {
    if (! (node instanceof Node) ) {
        return;
    }
    
    var url = "{{=URL('call/json/add_node')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:     g.mapID, 
            token:      node.id,
            x:          node.dim.x,
            y:          node.dim.y,
            width:      node.dim.width,
            height:     node.dim.height,
            name:       node.text
        }, function(data) {
        
        debugOut(data);
        // Validate data
        if (typeof(data.success) != "undefined") {
            if (data.success == true) {
                debugOut('success true!');
                // Update node id in all instances of the node
                // Graph.nodes hash
                var node = g.nodes[data.token];
                node.newNode = false;
                node.id = data.node_id;
                g.nodes[data.node_id] = node;
                delete g.nodes[data.token];
                
                // Draw order
                for (var i = g.drawOrder.length - 1; i >= 0; i--) {
                    if (g.drawOrder[i] == data.token) {
                        g.drawOrder[i] = node.id;
                        break;
                    }
                }
                
                // Undo stack
                for (var j = g.undoStack.length - 1; j >= 0; j--) {
                    var cmd = g.undoStack[j];
                    if (cmd.objId == data.token) {
                        cmd.objId = node.id;
                        if (cmd.property == g.cmdNodePlaceholder) {
                            break; // placeholder should be earliest occurrence of this node
                        }
                    }
                    
                }
            } else {
                // SUCCESS... Y U NO TRUE? 
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Add a new Edge on the graph to the DB
**/
Graph.prototype.db_addEdge = function(edge) {
    if (! (edge instanceof Edge)) {
        debugOut('Tried to add an edge that is not an edge');
    }
    
    var stringInnerPoints = JSON.stringify(edge.innerPoints);
    
    var url = "{{=URL('call/json/create_connection')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            token:          edge.id,
            node_one_id:    edge.from,
            node_two_id:    edge.to, 
            valence:        edge.valence,
            inner_points:   stringInnerPoints
        }, function(data) {
        
        debugOut('Got response from db!');
        debugOut(data);
        // Validate data
        if (typeof(data.success) != "undefined") {
            if (data.success == true) {
                var edge = g.edges[data.token];
                edge.newEdge = false;
                edge.id = data.id;
                g.edges[data.id] = edge;
                delete g.edges[data.token];
                
                // Undo stack
                for (var j = g.undoStack.length - 1; j >= 0; j--) {
                    var cmd = g.undoStack[j];
                    if (cmd.objId == data.token) {
                        cmd.objId = edge.id;
                        if (cmd.property == g.cmdNodePlaceholder) {
                            break; // placeholder should be earliest occurrence of this node
                        }
                    }
                    
                }
            } else {
                // SUCCESS... Y U NO TRUE? 
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Delete a node from the DB once it has been removed from the Graph
**/
Graph.prototype.db_deleteNode = function(node) {
    if (! (node instanceof Node) ) {
        debugOut('Tried to delete unknown object from database');
        debugOut(node);
        return;
    }
    
    var url = "{{=URL('call/json/remove_node')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID,
            node_id:        node.id
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Delete an Edge from the DB once it has been removed from the Graph
**/
Graph.prototype.db_deleteEdge = function(edge) {
    if (! (edge instanceof Edge) ) {
        debugOut('Tried to delete unknown object from database');
        return;
    }
    
    var url = "{{=URL('call/json/remove_connection')}}";
    debugOut(url);    
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            edge_id:        edge.id
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Change the valence of an Edge in the DB
**/ 
Graph.prototype.db_editEdgeValence = function(eid, newValence) {
    
    var url = "{{=URL('call/json/edit_connection_valence')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            edge_id:        eid,
            valence:        newValence
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    For complex edges consisting of a number of intermediary points, change the
    positions of those points stored in the DB
**/
Graph.prototype.db_editEdgeInnerPoints = function(edge) {
    // Construct inner points string
    var stringInnerPoints = JSON.stringify(edge.innerPoints);
    debugOut(edge.id);
    debugOut(stringInnerPoints);

    var url = "{{=URL('call/json/edit_connection_inner_points')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            edge_id:        edge.id,
            inner_points:   stringInnerPoints
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
        
}

/**
    Change the name (text) of a node in the DB
**/ 
Graph.prototype.db_renameNode = function(nid, newName) {
    var url = "{{=URL('call/json/rename_node')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            node_id:        nid,
            name:           newName
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Change the valence of a Node in the DB
**/
Graph.prototype.db_editNodeValence = function(nid, newValence) {
    
    var url = "{{=URL('call/json/edit_node_valence')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            node_id:        nid,
            valence:        newValence
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
    
}

/**
    Change the size/position of a Node in the DB
**/
Graph.prototype.db_editNodeDim = function(nid, dim) {
    
    var url = "{{=URL('call/json/edit_node_dim')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            node_id:        nid,
            x:              dim.x,
            y:              dim.y,
            width:          dim.width,
            height:         dim.height
        }, function(data) {
        
        if (! (data.success === undefined) ) {
            if (data.success) {
                
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            // ERROR: DB returned something strange
            debugOut('DB returned unexpected result');
            g.savingError = true;
        }
        
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Retrieve data for this Map from the DB and populate the Graph
**/
Graph.prototype.db_getGraphData = function() {
    
    var url = "{{=URL('call/json/get_graph_data')}}";
    debugOut(url);
    
    this.incrementPendingSaves();
    $.getJSON(
        url,
        {   
            map_id:         g.mapID
        }, function(data) {
        
        debugOut(data);
        if (typeof(data.success) != "undefined") {
            if (data.success) {
                var layoutAfter = false;
                for (var id in data.mapdata.nodes) {
                    var record = data.mapdata.nodes[id];
                    var text = record.text;
                    // Have to create new Node objects from returned data
                    var n = new Node(text, record.valence);
                    n.dim = record.dim;
                    // If the positions of a node are null, this means it was
                    // inserted by the chatbot, so we need to re-layout the Graph
                    if (!n.dim.x || n.dim.x == null) {
                        layoutAfter = true;
                    }
                    n.selected = false;
                    n.newNode = false;
                    n.id = id;
                    g.nodes[id] = n;
                    g.drawOrder.push(id);
                }
                
                if (layoutAfter) {
                    g.circleLayout();
                }
                
                for (var id in data.mapdata.edges) {
                    var record = data.mapdata.edges[id];
                    // Have to create a new Edge object from returned data
                    var e = new Edge();
                    e.from = record.from;
                    e.to = record.to;
                    e.valence = record.valence;
                    var innerPoints = JSON.parse(record.inner_points);
                    if (!innerPoints || innerPoints == null) {
                        innerPoints = [];
                    }
                    e.innerPoints = innerPoints;
                    e.id = record.id;
                    e.selected = false;
                    g.edges[id] = e;
                }
                
                // Set theme
                var savedTheme = data.mapdata.theme;
                if (savedTheme != null && savedTheme != "") {
                    debugOut("Not null theme: " + savedTheme)
                    for (var i in THEMES) {
                        var t = THEMES[i];
                        debugOut("trying: " + t.themeName);
                        if (t.themeName == savedTheme) {
                            g.setTheme(t);
                            break;
                        }
                    }
                } else {
                    g.setTheme(THEMES.DEFAULT);
                }
                
                g.repaint();
            } else {
                // ERROR
            }
        } else {
            debugOut('DB returned unexpected result');
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.decrementPendingSaves();
    });
}

/**
    Save the graph image (either full image or thumbnail) to the DB
**/ 
Graph.prototype.db_saveImage = function(imgdata, isThumbnail) {
    this.incrementPendingSaves();
    var url = "{{=URL('call/json/set_png')}}";
    if (isThumbnail) {
        url = "{{=URL('call/json/set_thumbnail')}}";
    }
    debugOut(url);
    
    $.post(
        url,
        {   
            map_id:         g.mapID,
            imgdata:        imgdata
        }, function(data) {
        
        if (typeof(data.success) != "undefined") {
            if (data.success) {
                debugOut("Save thumbnail success!");
            } else {
                // Error
                g.savingError = true;
            }
        } else {
            debugOut("DB returned unexpected result");
            g.savingError = true;
        }
        g.decrementPendingSaves();
    }).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    Save current theme to the DB
**/
Graph.prototype.db_saveTheme = function() {
    this.incrementPendingSaves();
    var url = "{{=URL('call/json/set_theme')}}";
    $.getJSON(
        url,
        {   
            map_id:         g.mapID, 
            theme:          g.theme.themeName
        }, function(data) {
            
            if (typeof(data.success) != "undefined") {
                if (data.success) {
                    debugOut("Save theme success!");
                } else {
                    g.savingError = true;
                }
            } else {
                debugOut("DB returned unexpected result");
                g.savingError = true;
            }
            g.decrementPendingSaves();
        }
    ).error(function(data) {
        g.savingError = true;
        g.decrementPendingSaves();
    });
}

/**
    incrementPendingSaves and decrementPendingSaves are used to keep track
    of the AJAX calls made. 
    
    TODO: this can probably be handled by jQuery in the future. 
**/
Graph.prototype.incrementPendingSaves = function() {
    this.pendingSaves += 1;
}

Graph.prototype.decrementPendingSaves = function() {
    this.pendingSaves -= 1;
    
    if (this.pendingSaves == 0) {
        // Clear the "Saving" message from the screen and redirect if necessary
        $.unblockUI({
            onUnblock: function() {
                // TODO: this is the restoration logic
                /*if (g.savingError) {
                    var saveString = g.createSaveString();
                    debugOut(saveString);
                    // Display dialog
                    $('#saveString').modal();
                    $('#save-text').val(saveString);
                    // $('#saveStringDisplay').css();
                }*/
                if (g.redirectOnSave != "") {
                    location.href = g.redirectOnSave;
                }
            }
        });
    } 
}
