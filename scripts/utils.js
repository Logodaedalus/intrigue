
//------------------------------------------------------------------------------
// Object inheritance taken from http://ejohn.org/blog/simple-javascript-inheritance/
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

//------------------------------------------------------------------------------

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//------------------------------------------------------------------------------
var consoleLogArray = [];           //array of arrays, holds messages for console
var consoleLogLevel = 1;            //this is actually set in game.js at the top

function consoleLog(level, message) {         //1 is basic checks, 2 is more verbose, 3 is totally verbose

  consoleLogArray.push([level, message]);          //add it to console array
  
  $("#console").append("<p class='consoleLine level"+ level +"'>"+ message +"<p>");

  /* if (level <= consoleLogLevel) {        //if current setting is good, consoleLog it
      console.log(message);
  } */
}

function changeConsoleLevel(level) {

  $(".consoleLine").hide();
  $(".consoleLine.level" + level).show();
  if (level == "3") {
    $(".consoleLine.level2").show();
    $(".consoleLine.level1").show();
  }
}

function getRandom(min, max) {     //return a random number within the range
  return Math.floor(Math.random() * (max - min + 1)) + min;  
}

function getWeightedRandomItem(list, weight) {      //list and weight are arrays of equal length
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
        return prev + cur;
    });
     
    var random_num = getRandom(0, total_weight);
    var weight_sum = 0;
     
    for (var i = 0; i < list.length; i++) {
        weight_sum += weight[i];
        weight_sum = +weight_sum.toFixed(2);
         
        if (random_num <= weight_sum) {
            return list[i];
        }
    }
     
    // end of function
}