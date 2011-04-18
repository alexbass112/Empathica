/** 
    API provided to the Graph's parent container
    These are the only functions that should be called from outside the
    graph.*.js library
    
    Author:         Alex Bass 
    Last Updated:   2011-04-17
 **/ 

/**
    Set input state 
    Available states: 
        Graph.stateAddingNodes
        Graph.stateAddingEdges
        Graph.stateAddingComments
        Graph.stateDefault
 **/
Graph.prototype.setState = function(state) {
    return this.setStateFromUI(state);
}

/**
    Retrieve Graph data from the database on page load
**/
Graph.prototype.initGraphFromDB = function() {
    return this.db_getGraphData();
}

/**
    Save Graph data to the database. 
    If a redirect is provided, the page will redirect after saving is completed.
**/
Graph.prototype.saveGraph = function(redirect) {
    if (redirect) {
        this.redirectOnSave = redirect;
    }
    return this.squishAndSave();
}

/**
    Set the colour scheme of the graph. For a list of available themes, 
    consult graph.themes.js
**/
Graph.prototype.setTheme = function(newTheme) {
    this.theme = newTheme;
    this.db_saveTheme();
    this.repaint();
}

/**
    Add a node from the Node suggestions drag & drop interface to the Graph
**/
Graph.prototype.addSuggestedNode = function(id, text, x, y) {
    return this.suggestedNode(id, text, this.neutralValence, x, y);
}

