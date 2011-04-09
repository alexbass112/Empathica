
//var g;

function testIt() {
    
    
    
    var gg = new Graph();
    //g.initEventListeners();

    /*var n = gg.addNode("Valence 1 Valence 1 Valence 1", normalize(1));
    //g.resizeDiv(n);
    gg.addNode("Valence 2", normalize(2));
    
    
    if (isDeviceType("iphone")) {
        gg.addNode("IPHONE", normalize(1));
    } else if (isDeviceType("ipod")) {
        gg.addNode("IPOD", normalize(4));
    } else {
        gg.addNode(navigator.userAgent, normalize(7));
    }*/
    
    /*g.addNode("Valence 3", normalize(3));
    g.addNode("Valence 4", normalize(4));
    g.addNode("Valence 5", normalize(5));
    g.addNode("Valence 6", normalize(6));
    g.addNode("Valence 7", normalize(7));*/
    /*g.addNode("Valence 2", normalize(2));
    g.addNode("Valence 3", normalize(3));
    g.addNode("Valence 4", normalize(4));
    g.addNode("Valence 5", normalize(5));
    g.addNode("Valence 6", normalize(6));
    g.addNode("Valence 7", normalize(7));
    g.addNode("Valence 2", normalize(2));
    g.addNode("Valence 3", normalize(3));
    g.addNode("Valence 4", normalize(4));
    g.addNode("Valence 5", normalize(5));
    g.addNode("Valence 6", normalize(6));
    g.addNode("Valence 7", normalize(7));
    g.addNode("Valence 2", normalize(2));
    g.addNode("Valence 3", normalize(3));
    g.addNode("Valence 4", normalize(4));
    g.addNode("Valence 5", normalize(5));
    g.addNode("Valence 6", normalize(6));
    g.addNode("Valence 7", normalize(7));*/
    
    /*g.addEdge(0,1,normalize(1));
    g.addEdge(1,2,normalize(1));
    g.addEdge(2,3,normalize(2));
    g.addEdge(3,4,normalize(4));*/
    //gg.draw();
    
    $('#defaultButton').click( function(e) {
        
        return false;
    });
    
}

function normalize(val) {
    var x = val - 1; // from 1-7 to 0-6
    x = (x / 6) * 2; // from 0-6 to 0-2
    x -= 1; 
    return x;
}

