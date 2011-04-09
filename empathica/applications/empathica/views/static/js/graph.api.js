// API provided to the Graph's parent container

/*
    Set input state 
    Available states: 
        Graph.stateAddingNodes
        Graph.stateAddingEdges
        Graph.stateAddingComments
        Graph.stateDefault
 */
Graph.prototype.setState = function(state) {
    return this.setStateFromUI(state);
}

Graph.prototype.initGraphFromDB = function() {
    return this.db_getGraphData();
}

Graph.prototype.saveGraph = function(redirect) {
    if (redirect) {
        this.redirectOnSave = redirect;
    }
    return this.squishAndSave();
}

Graph.prototype.setTheme = function(newTheme) {
    this.theme = newTheme;
    this.db_saveTheme();
    this.repaint();
}

Graph.prototype.addSuggestedNode = function(id, text, x, y) {
    return this.suggestedNode(id, text, this.neutralValence, x, y);
}

