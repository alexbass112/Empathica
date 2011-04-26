/** 
    All-purpose util functions used throughout the graphing library
    Functions in this file are not dependent on the Empathica graph library 
    
    Author:         Alex Bass 
    Last Updated:   2011-04-17
 **/ 

var debug = true;

/**
    Output data to a debug console 
    Works with either Dev Tools in Chrome/IE or FireBug in Firefox
**/
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

/**
    Check client device type
    @returns true if device type matches provdied string
**/
function isDeviceType (typeString) {
    var is = (new RegExp( typeString,"i")).test(navigator.userAgent);
    return is;
}

/**
    Create a "random" GUID using the JavaScript Math.random() fxn
    
    guid() returns the guid (string) made up of S4() components
**/
// From http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

/**
    Disable the Form Submit event when hitting the Enter key on 
    a text input field.
**/
function stopRKey(evt) { 
  var evt = (evt) ? evt : ((event) ? event : null); 
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null); 
  if ((evt.keyCode == 13) && (node.type=="text"))  {return false;} 
} 

/**
    Measure the straight-line distance between two points in 2D space
    
    @returns distance as float
**/
function distanceBetweenPoints( ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return Math.sqrt( dx*dx + dy*dy );
}

/**
    Measure the angle of the rise of two points in 2D space
    
    @returns float angle between 0 and PI/2
**/
function angle(ax, ay, bx, by) {
    var rise = Math.abs(by-ay);
    var run = Math.abs(bx-ax);
    
    return Math.tan(rise/run);
}

/**
    Create a string representation from integer or float colour values, including an
    alpha value. 
    Note: set a = 255 for opaque
    
    @returns string representation of colour
**/
function makeColour(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"; 
}
