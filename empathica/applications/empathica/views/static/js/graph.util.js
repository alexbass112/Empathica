
var debug = false;

function debugOut( data ) {
        
    if (debug) {
        log(data);
    }
}

function log( data ) {
    if (typeof console != "undefined") {
        console.log(data);
    } 
}

function isDeviceType (typeString) {
    var is = (new RegExp( typeString,"i")).test(navigator.userAgent);
    return is;
}

// From http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function stopRKey(evt) { 
  var evt = (evt) ? evt : ((event) ? event : null); 
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;} 
} 

function distanceBetweenPoints( ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return Math.sqrt( dx*dx + dy*dy );
}

function angle(ax, ay, bx, by) {
    var rise = Math.abs(by-ay);
    var run = Math.abs(bx-ax);
    
    return Math.tan(rise/run);
}

function makeColour(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"; 
}

/* 
    From: http://blogs.sitepoint.com/2006/01/17/javascript-inheritance/
 */ 
function copyPrototype(descendant, parent) {
    var sConstructor = parent.toString();
    var aMatch = sConstructor.match( /\s*function (.*)\(/ );
    if ( aMatch != null ) { descendant.prototype[aMatch[1]] = parent; }
    for (var m in parent.prototype) {
        descendant.prototype[m] = parent.prototype[m];
    }
}

