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
        
        this.rounds = 35;
        this.numPlayers = 4;
        this.humansPlaying = 0;
        this.numQualities = 4;           //number of qualities used in game (with tarot we have 338 max)
        this.numStartingChips = 25;      //number of starting chips
        this.dominionBonus = 1;          //the amount of bonus Dominions get when people use their quality
        this.autoplay = false;           //whether play happens automatically globally
        consoleLogLevel = 3;             //3 = verbose console, 2 = turn info, 1 = most basic

        this.players = [];               //holds players
        this.watchers = [];              //holds who is watching the next action {"watcher": "bot1", "target" : bot2" }
        this.qualities = [];            //array of quality objects for game
        this.currentPlayer = 0;              //index in players[] whose turn it is
        this.currentRound = 0;          //current round
        

        this.initQualities();
        this.createPlayers();
        this.initUI();
        this.play();
    },

    createPlayers: function () {        //create players for game
        for (var x=0; x < (this.numPlayers - this.humansPlaying); x++) {        //create bots of random type
            var bot;
            /* uncomment when there's more than 1 bot type
            var choice = Math.floor(Math.random()*2+1);         //pick a number between 1 and 2
            if (choice == 1) { bot = new RandomBot("randomBot" + x); }
            else { bot = new SimpleBot("simpleBot" + x); }
            
            this.players.push(bot);                             //add it to players
            */
            bot = new RandomBot("randomBot" + x, true, this);
            this.players.push(bot);
        }

        for (var x=0; x < this.humansPlaying; x++) {
            var player;
            if (this.humansPlaying > 1) { 
                var tempName = prompt("Please enter your name", "Unique player name");
                player = new Player(tempName, "human", this);
            }
            else { player = new Player("Jacob", "human", this); }

            this.players.push(player);
        }

        for (var x=0; x < this.players.length; x++) {   //we can't populate the player model until all the players have been created
            this.players[x].populatePlayerModel(this);
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

    initUI: function () {      //create UI

        //create game-wide info window
        var gameInfoHtml = "<p>Players: "+ this.numPlayers +" ("+ this.humansPlaying +" human / "+ (this.numPlayers - this.humansPlaying) +" bot)</p><p>Current Round: "+ this.currentRound +"/"+ this.rounds +"</p><p>Number of Qualities: "+ this.numQualities +"</p><p>Number of Starting Chips: "+ this.numStartingChips +"</p>";
        $("#game").append(gameInfoHtml);

        for (var x=0; x < this.players.length; x++) {       //for each player

            if (this.players[x].type == "bot") {     //if it's a bot, create bot display
                this.createBotUI(x);
            }
            else {      //if it's human, create human display
                this.createHumanUI(x);
            }
        }

        $("#players").tabs();

        consoleLog(3, "initialized display!");
    },

    createHumanUI: function (playerIndex) {   //creates the interface for human players
        
        jQuery('<li/>', {           //tab
                id: this.players[playerIndex].name + 'Tab',
                html: '<a href="#'+ this.players[playerIndex].name +'Panel">'+ this.players[playerIndex].name + '</a>',
            }).appendTo('#UITabs');

        jQuery('<div/>', {          //main panel
                class: 'playerWindow',
                id: this.players[playerIndex].name + 'Panel',
            }).appendTo('#panels');

        jQuery('<div/>', {          //current info
                class: 'info',
                id: this.players[playerIndex].name + 'Info',
                html: '<h2>Info</h2>',
            }).appendTo('#' + this.players[playerIndex].name + 'Panel');

        jQuery('<div/>', {          //make move button
                class: 'makeMove',
                id: this.players[playerIndex].name + 'makeMove',
                html: 'Make move',
            }).appendTo('#' + this.players[playerIndex].name + 'Panel');

        $( "#" + this.players[playerIndex].name + "makeMove" ).click(function() {
            this.players[this.currentPlayer].takeTurn(this);
        });

        jQuery('<div/>', {          //player actions
                class: 'playerAction',
                id: this.players[playerIndex].name + 'Action',
                html: '<h2>Turn History</h2><ul></ul>',
            }).appendTo('#' + this.players[playerIndex].name + 'Panel');

        $('#' + this.players[playerIndex].name + 'Info').append("<table class='stats' id='"+this.players[playerIndex].name+"Stats'><tr class='tableData'></tr><tr class='tableLabel'></tr></table>");     //add stats table

        var dataHeight = 200;           //height of data columns in pixels
        var maxQualNum = this.numStartingChips + (this.numStartingChips / 2);           //max out the graph at twice the initial starting chips in one category

        for (var x=0; x < this.numQualities; x++) {
            $("#" + this.players[playerIndex].name + "Stats .tableData").append("<td class='"+ this.qualities[x].name +"'></td>");
            var heightPercentage = this.players[playerIndex].secrets[x].value[0] / maxQualNum * 100;
            var dataCell = this.players[playerIndex].name + "Stats .tableData ." + this.qualities[x].name;
            $("#" + dataCell).width(100 / this.numQualities + "%");
            $("#" + dataCell).append("<div>"+ this.players[playerIndex].secrets[x].value[0] +"</div>");
            $("#" + dataCell + " div").height( heightPercentage + "%");           //set height
            $("#" + this.players[playerIndex].name + "Stats .tableLabel").append("<td class='"+ this.qualities[x].name +"'>" + this.qualities[x].name + "</td>");

        }
    },

    createBotUI: function (playerIndex) {      //creates the interface for bot players
        
        jQuery('<li/>', {           //tab
                id: this.players[playerIndex].name + 'Tab',
                html: '<a href="#'+ this.players[playerIndex].name +'Panel">'+ this.players[playerIndex].name + '</a>',
            }).appendTo('#UITabs');

        jQuery('<div/>', {          //main panel
                class: 'playerWindow',
                id: this.players[playerIndex].name + 'Panel',
            }).appendTo('#panels');

        jQuery('<div/>', {          //current info
                class: 'info',
                id: this.players[playerIndex].name + 'Info',
                html: '<h2>Info</h2>',
            }).appendTo('#' + this.players[playerIndex].name + 'Panel');

        jQuery('<div/>', {          //make move button
                class: 'makeMove',
                id: this.players[playerIndex].name + 'makeMove',
                html: 'Make move',
            }).appendTo('#' + this.players[playerIndex].name + 'Panel');

        $( "#" + this.players[playerIndex].name + "makeMove" ).click(function() {
            this.players[this.currentPlayer].takeTurn(this);
        });

        jQuery('<div/>', {          //player actions
                class: 'playerAction',
                id: this.players[playerIndex].name + 'Action',
                html: '<h2>Turn History</h2><ul></ul>',
            }).appendTo('#' + this.players[playerIndex].name + 'Panel');

        $('#' + this.players[playerIndex].name + 'Info').append("<table class='stats' id='"+this.players[playerIndex].name+"Stats'><tr class='tableData'></tr><tr class='tableLabel'></tr></table>");     //add stats table

        var dataHeight = 200;           //height of data columns in pixels
        var maxQualNum = this.numStartingChips + (this.numStartingChips / 2);           //max out the graph at twice the initial starting chips in one category

        for (var x=0; x < this.numQualities; x++) {
            $("#" + this.players[playerIndex].name + "Stats .tableData").append("<td class='"+ this.qualities[x].name +"'></td>");
            var heightPercentage = this.players[playerIndex].secrets[x].value[0] / maxQualNum * 100;
            var dataCell = this.players[playerIndex].name + "Stats .tableData ." + this.qualities[x].name;
            $("#" + dataCell).width(100 / this.numQualities + "%");
            $("#" + dataCell).append("<div>"+ this.players[playerIndex].secrets[x].value[0] +"</div>");
            $("#" + dataCell + " div").height( heightPercentage + "%");           //set height
            $("#" + this.players[playerIndex].name + "Stats .tableLabel").append("<td class='"+ this.qualities[x].name +"'>" + this.qualities[x].name + "</td>");

        }
    },

    updateUI: function ()  {   //update the UI with values
        consoleLog(3, "updated display!");
    },

    barterTurn: function() {
        return "you bartered!";
    },

    pryTurn: function(pryerName, targetName, qualityUsed, amountUsed) {
    /*
        -whoever has less in the match, half their quality's chips go to the winner, and they get half their chips back
        -the person that currently has the current game leader of the prying color gets an additional chip
        -TODO: who you pryed is broadcast to everyone, but not the outcome
    */ 
        var theAttacker = $.grep(this.players, function (h) { return h.name == pryerName })[0];
        var attackerWeight = $.grep(this.qualities, function (h) { if (h.name == qualityUsed) { return h; } })[0].weight;
        var attackerScore = attackerWeight * amountUsed;

        var theTarget = $.grep(this.players, function (h) { return h.name == targetName })[0];
        var targetResponse = theTarget.parry(this, pryerName, qualityUsed, amountUsed);       //get reply: which quality and how much target is putting up 
        var targetWeight = $.grep(this.qualities, function (h) { if (h.name == targetResponse.quality) { return h; } })[0].weight;
        var targetScore = targetWeight * targetResponse.amountUsed;

        var result;         //this is either "won", "lost", or "tie"
        var chipsNum;

        if (attackerScore > targetScore) {        //if attacker won (winner gets half the other person's chips)
            result = "won";
            chipsNum = Math.ceil(targetResponse.amountUsed / 2);        //take half the chips, rounded up
            $.grep(theAttacker.secrets, function (h) { if (h.quality == targetResponse.quality) { 
                var oldVal = h.value[0];
                h.value[0]+=chipsNum; h.value[1]+=chipsNum; 
                consoleLog(3, "Attacker's value of " + targetResponse.quality + " went from " + oldVal + " to " + h.value[0]);
            } });
            $.grep(theTarget.secrets, function (h) { if (h.quality == targetResponse.quality) { 
                var oldVal = h.value[0];
                h.value[0]-=chipsNum; h.value[1]-=chipsNum; 
                consoleLog(3, "Defenders's value of " + targetResponse.quality + " went from " + oldVal + " to " + h.value[0]);
            } });
        }

        else if (attackerScore < targetScore) {        //if defender won (winner gets half the other person's chips)
            result = "lost";
            chipsNum = Math.ceil(amountUsed / 2);        //take half the chips, rounded up
            $.grep(theAttacker.secrets, function (h) { if (h.quality == qualityUsed) { 
                var oldVal = h.value[0];
                h.value[0]-=chipsNum; h.value[1]-=chipsNum; 
                consoleLog(3, "Attacker's value of " + qualityUsed + " went from " + oldVal + " to " + h.value[0]);
            } });
            $.grep(theTarget.secrets, function (h) { if (h.quality == qualityUsed) { 
                var oldVal = h.value[0];
                h.value[0]+=chipsNum; h.value[1]+=chipsNum; 
                consoleLog(3, "Defender's value of " + qualityUsed + " went from " + oldVal + " to " + h.value[0]);
            } });
        }

        else {      //if there was a tie, no chips trade hands
            result = "tie";
            chipsNum = 0;
        }        
        
        consoleLog(2, pryerName + " " + result + "!");

        this.updateDominion(qualityUsed, this.dominionBonus);        //find person with highest amount of prying quality and give them another chip for that quality

        //now we need to calculate the learned facts and send them back!
        var attackerRange = [];         //fact about the attacker's range
        var defenderRange = [];         //fact about the defender's range

        if (result == "lost") { 
            attackerRange = [1, (targetResponse.amountUsed - 1)];      //we know the attacker had a least 1 less than defender, possibly just 1
            defenderRange = [(amountUsed + 1), -1];                   //we know the defender must have at least 1 more than attacker
        }
        if (result == "won") { 
            attackerRange = [(targetResponse.amountUsed + 1), -1];    //we know the attacker had at least one more than defender
            defenderRange = [0, (amountUsed - 1)];                    //we know defender had at least one less max than attacker
        }
        if (result == "tie") { 
            attackerRange = [amountUsed, amountUsed];
            defenderRange = [amountUsed, amountUsed];
        }

        var attackersFact = new Fact(targetName, targetResponse.quality, defenderRange[0], defenderRange[1]);    //the pryer's learned fact ABOUT the defender
        var defendersFact = new Fact(pryerName, qualityUsed, attackerRange[0], attackerRange[1]);                //the defender's learned fact ABOUT the pryer

        consoleLog(3, "updating defender's model of attacker...");
        theTarget.updatePlayerModel(defendersFact);             //update the defender's model of the attacker

        this.updateWatchers(attackersFact);          //update any watchers
        this.updateWatchers(defendersFact);          //update any watchers

        return ({"result": result, "fact" : attackersFact});      //return to pryer whether it was successful or not, and the quality delta
    },

    waitWatch: function(watcher, target) {      //add watcher to list to check when actions happen

        this.watchers.push({"watcher": watcher, "target" : target });

    },

    play: function () {       //start a round of the game

        this.currentPlayer++;   //increment player

        if (this.currentPlayer == this.numPlayers) {     //if necessary, increment round and reset player
            this.currentPlayer = 0;
            this.currentRound++;
        }

        $("#players").tabs("option", "active" , this.currentPlayer);       //click to activate their tab

        if (this.currentRound == this.rounds) {         //if necessary, decide winner
            this.decideWinner();
        }

        else if (this.autoplay || this.players[this.currentPlayer].autoplay) {      //otherwise, if autoplay for game is on or autoplay for player is on
            consoleLog(3, "------------------------------");
            consoleLog(3, this.players[this.currentPlayer].name + "'s Turn");
            consoleLog(3, "------------------------------");
            this.players[this.currentPlayer].takeTurn(this);                        //take turn
            this.play();                                                            //call play again
        }
    },

    decideWinner: function () {
        consoleLog(2, "-----------------------------------------------------------");
        consoleLog(2, "**************TIME FOR FINAL GUESSES**************");
        consoleLog(2, "-----------------------------------------------------------");


        for (var x=0; x < this.players.length; x++) {       //for every player...
            var tempPlayer = this.players[x];
            consoleLog(3, "guessing about " + tempPlayer.name);

            for (var y=0; y < tempPlayer.secrets.length; y++) {     //for every secret...
                consoleLog(3, "specifically, their " + tempPlayer.secrets[y].quality + " (which is " + this.players[x].secrets[y].value[0] + ")");
                var tempSecret = tempPlayer.secrets[y];
                var guess = this.getClosestGuess(tempPlayer, tempSecret.quality);        //populate each player's secrets with best guess and final amount
                var finalValue = Math.abs(guess.guess - tempSecret.value[0]);
                if (finalValue > tempSecret.value[0]) { finalValue = tempSecret.value[0];}      //final value can't be more than total chips in quality

                this.players[x].secrets[y].finalValue = finalValue;
                this.players[x].secrets[y].bestGuesser = guess.guesser.name;
                this.players[x].secrets[y].bestGuess = guess.guess;

                consoleLog(3, "---the best guess about " + tempPlayer.name + "'s " + tempPlayer.secrets[y].quality + " is " + guess.guesser.name + "'s guess of " + guess.guess);
            }
        }

        var winner = {"player": "none", "qualityName": "none", "value": 0};
        for (var x=0; x < this.players[0].secrets.length; x++) {     //this assumes each person's qualities are in the same order but that's ok right?
            var best = this.players.reduce(function (prev, curr) {
                return (curr.secrets[x].finalValue > prev.secrets[x].finalValue ? curr : prev);
            });
            if (best.secrets[x].finalValue > winner.value) {
                winner.player = best.name;
                winner.qualityName = this.players[0].secrets[x].quality;
                winner.value = best.secrets[x].finalValue;
            }
        }

        consoleLog(1, "The winner is " + winner.player + ", with a " + winner.qualityName + " score of " + winner.value + "!");

        
    },

    getClosestGuess: function (player, quality) {       //gets the closest guess of all the players about a player's specific quality
    
        var guesses = [];
        var qualityAmount = $.grep(player.secrets, function (h) { return h.quality == quality })[0].value[0];
        
        for (var x=0; x < this.players.length; x++) {
            if (this.players[x].name !== player.name) {          //don't guess about yourself
                consoleLog(3, this.players[x].name + " is guessing.");
                guesses.push({"guesser" : this.players[x], "guess": this.players[x].finalGuess(player, quality)});      //add all players' guesses
            }
        }
        
        var closest = guesses.reduce(function (prev, curr) {        //get closest guess from array of guesses
          return (Math.abs(curr.guess - qualityAmount) < Math.abs(prev.guess - qualityAmount) ? curr : prev);
        });

        return closest;
    },

    updateWatchers: function (theFact) {
        consoleLog(2, "whoever was watching " + theFact.player + " would update here.");
    },

    updateDominion: function (quality, amount) {        //updates the current player with the highest amount in particular quality

        var qualIndex;

        for (var x=0; x < this.players[0].secrets.length; x++) {
            if (this.players[0].secrets[x].quality == quality) { qualIndex = x; }
        }

        var dominion = this.players.reduce(function(prev, current) {        //TODO: this gives chips to person even if tied...needs to not do that!
            return (prev.secrets[qualIndex].value[0] > current.secrets[qualIndex].value[0]) ? prev : current
        }) //returns object

        dominion.secrets[qualIndex].value[0] += amount;
        dominion.secrets[qualIndex].value[1] += amount;
        consoleLog(2, "the Dominion of " + quality + " (" + dominion.name + ") has gained " + amount + ", and is now " + dominion.secrets[qualIndex].value[0]);
    }

});

//-----------------------------------------------------------------------------

var Quality = Class.extend({
    init: function(theName,weight) {
        this.name = theName;
        this.weight = weight;        //this is our starter...later on we'll want to deform weights in relation to other qualities, so we'll want to change this data type to an object with a target and weight? (so it's an edge in a directed graph)
    },
});

//-----------------------------------------------------------------------------

var Fact = Class.extend({
    init: function(player, quality, low, high) {
        this.player = player;
        this.quality = quality;
        this.value = [low, high];
    },
});

//------------------------------------------------------------------------------

