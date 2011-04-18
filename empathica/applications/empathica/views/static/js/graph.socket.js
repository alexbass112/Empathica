/** 
    Google app engine socket calls. 
    
    GAE sockets allow different users working on the same Map to 
    receive each other's updates in real time. 
    
    TODO: in order to use this effectively, some changes need to be
    made to the saving algorithm - instead of batching save ops, save 
    each change to the database as soon as it is performed. 
    
    Author:         James Kendle
    Last Updated:   2011-04-17
 **/ 
Graph.prototype.socketOnOpened = function()
{
    debugOut("Socket Opened");
}

Graph.prototype.socketOnMessage = function(message)
{
    return;
    var data = eval('(' + message.data + ')');
    
    if(data.type == "nodeadd")
    {
        var record = data.node;
        
        if(g.nodes[record.id] === undefined)
        {
            var layoutAfter = false;
            var text = record.text;
            var n = new Node(text, record.valence);
            n.dim = record.dim;
            if (!n.dim.x || n.dim.x == null) {
                layoutAfter = true;
            }
            n.selected = false;
            n.newNode = false;
            n.highLight = g.lowColour;
            n.id = record.id;
            g.nodes[n.id] = n;
            g.drawOrder.push(n.id);
            
            if(layoutAfter)
            {
                g.layout();
            }
            
            g.repaint();
            
            debugOut("n:");
            debugOut(n);
        }
    }
    else if (data.type == "noderemove")
    {
        var node = data.node;
        
        if(!(g.nodes[node.id] === undefined))
        {
            // remove the node from g.nodes
        }
    }

    debugOut(data);
}

Graph.prototype.socketOnError = function()
{
    debugOut("Socket Error");
}

Graph.prototype.socketOnClose = function()
{
    debugOut("Socket Close");
}