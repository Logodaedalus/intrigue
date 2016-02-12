/*
Every player has 3 collections of chips

To start, each person draws 20 total chips


You pry a person
--------------------------
-whoever has less in the match, half their chips go to the winner, and they get half their chips back
-the person that currently has the current game leader of the prying color gets an additional chip
-who you pryed is known to everyone, but not the outcome

You barter information with a person
--------------------------
-you choose the information you want to give a person
-you can lie
-if you lie, you lose trust

You can watch
--------------------------
You don't do anything, but all information about next pry you get as well
No player knows you're watching, or that you will be watching

-at the end of the game (some number of rounds) each player makes a guess as to the number of chips the other players have
-whoever has the most chips of a color whose best guess against is the furthest off, wins
-Ex.

Jacob
    -R: 15 (kate guesses 15, aaron guesses 14 = 0) 0
    -B: 10 (kate guesses 15, aaron guesses 5 = 5) 5
    -G: 25 (kate guesses 23, aaron guesses 21 = 2) 2
Best: B at 5

Kate
    -R: 2 (jacob guesses 16, aaron guesses 20) (2-16) / 2 = 7, but is capped to max out at 2
    -B: 10
    -G: 25

Aaron
    -R: 5
    -B: 15
    -G: 8
*/

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype


//------------------------------------------------------------------------------

var Game = Class.extend({
    init: function(theName){
        
        this.rounds = 25;
        this.numPlayers = 5;
        this.humansPlaying = 0;
        this.numQualities = 3;           //number of qualities used in game (with tarot we have 338 max)
        this.numStartingChips = 25;      //number of starting chips
        
        this.players = [];               //holds players
        this.watchers = [];              //holds who is watching the next action
        this.qualities = [];            //array of quality objects for game
        this.currentPlayer = 0;              //index in players[] whose turn it is
        this.currentRound = 0;

        this.initQualities();
        this.createPlayers();
        this.initDisplay();
        this.play();
    },

    createPlayers: function () {        //create players for game
        for (var x=0; x < (this.numPlayers - this.humansPlaying); x++) {        //create bots of random type
            var bot;
            /* uncomment when there's more than 1 bot
            var choice = Math.floor(Math.random()*2+1);         //pick a number between 1 and 2
            if (choice == 1) { bot = new RandomBot("randomBot" + x); }
            else { bot = new SimpleBot("simpleBot" + x); }
            
            this.players.push(bot);                             //add it to players
            */
            bot = new RandomBot("randomBot" + x, true, this);
            this.players.push(bot);
        }

        for (var x=0; x < this.humansPlaying; x++) {
            var player = new Player("Jacob", false, this);
            this.players.push(player);
        }

        shuffle(this.players);
    },

    initQualities: function () {    //initializes the qualities object, and adds string of qualities to lits
        
        var unique = {};                //placeholder, don't use
        var distinct = [];              //distinct qualities
        for( var i in tarot ){          //grab only distinct qualities from the tarot list
            for (var j in tarot[i].keywords) {
                if( typeof(unique[tarot[i].keywords[j]]) == "undefined"){
                    distinct.push(tarot[i].keywords[j]);
                }
            }
            unique[tarot[i].age] = 0;
        }
        
        for (var x = 0; x < this.numQualities; x++) {
            var tempQual = new Quality(distinct[x],1);
            this.qualities.push(tempQual);
        }

    },

    initDisplay: function () {      //create UI
        console.log("initialized display!");
    },

    updateDisplay: function ()  {   //update the UI with values
        console.log("updated display!");
    },

    barterTurn: function() {
        return "you bartered!";
    },

    pryTurn: function(pryerName, targetName, qualityUsed, amountUsed) {
    //take incoming pry, get defense response from target, adjudicate result, modify world, and return to pryer whether it was successful or not, and what that person's data is
    /*
        -whoever has less in the match, half their quality's chips go to the winner, and they get half their chips back
        -the person that currently has the current game leader of the prying color gets an additional chip
        -who you pryed is known to everyone, but not the outcome
    */  
        //find person with highest amount of prying quality and give them another chip for that quality
        //get reply: which quality and how much target is putting up
        //compare qualities and determine winner
        //if tie, no chips trade hands
        //whoever wins gets half the other person's chips they put in
        
        //if won, return reply with additional boolean of whether pry succeeded and info of opponent's response (type and amount)
        //if lost, return false and that's it
        //if tie, return "tie" and that's it
        return "you pried!";
    },

    waitWatch: function() {
        return "you wait watched!";
    },

    play: function () {       //start a round of the game

        for (this.currentRound; this.currentRound < this.rounds; this.currentRound++) {    //do all rounds of the game
            console.log("-------------------------------------------");
            console.log("round " + this.currentRound + " started!");
            
            for (this.currentPlayer; this.currentPlayer <= this.numPlayers - 1; this.currentPlayer++) {     //do all turns in the round
                console.log("player " + this.currentPlayer + " takes a turn!", this.players[this.currentPlayer]);
                this.players[this.currentPlayer].takeTurn(this);
            }
            
            this.currentPlayer = 0;            //reset to first player for next round
            
        }

        this.decideWinner();                    //after all the turns are taken, let players take their guesses

    },

    decideWinner: function () {
        console.log("it's over!");
    }
});

//-----------------------------------------------------------------------------

var Quality = Class.extend({
    init: function(theName,weight){
        this.name = theName;
        this.weight = weight;        //this is our starter...later on we'll want to deform weights in relation to other qualities, so we'll want to change this data type to an object with a target and weight? (so it's an edge in a directed graph)
    },
});

//-----------------------------------------------------------------------------


$(document).ready(function(){
    $('#pry').click(function(){
        
    });
});

var game = new Game();