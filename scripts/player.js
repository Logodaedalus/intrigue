var Player = Class.extend({                 //the default player (human-controlled)
    init: function(theName, isAI, game){
        this.name = theName;
        this.isAI = isAI;
        this.secrets = [];          //this is the qualities along with their values
        this.players = [];          //current model of players

        this.pickPieces(game);
        this.populatePlayerModel(game);
    },
    
    populatePlayerModel : function (game) {
    /*
    Starting assumptions: other players have some number of chips in qualities that can't be higher than the total number of chips
    */

        for (var x in game.players) {

            var secretsInfo = [];

            for (var y in game.qualities) {
                secretsInfo.push([0,game.numStartingChips]);
            }

            var startingInfo = { "name" : game.players[x].name, "secrets" : secretsInfo }
            
            this.players.push(startingInfo);
        }
    },
    pickPieces : function (game) {

    },
    takeTurn : function (game) {        //all players need to have this function
        
    },

    pry: function (game)  {
    //pry a player. You have a target you're prying (string), the quality you're using to pry (string), and the amount you're using (int)
        var target;
        var qualityUsed;
        var amountUsed;

        console.log(this.name + " pryed " + target + " with " + amountUsed + " " + qualityUsed + "!");

        var outcome = game.pryTurn();            //take action
        
        //deal with info from outcome here
    },

    barterInfo: function (game) {
    //barter info with another player. You give info, in return for info. If your info is more exact, you earn trust

        var target;
        var infoGiven;

        console.log(this.name + " bartered info with " + target + ", and offered info of...", infoGiven);
        
        var outcome = game.barterTurn();

        //deal with info from outcome here
    },

    waitWatch: function (game) {
    //pass your turn, but the next action that's taken will be known to you in its full

        console.log(this.name + " is biding their time.");

        var outcome = game.waitWatch();

        //deal with info from outcome here
    }
});
 
//-----------------------------------------------------------------------------

var RandomBot = Player.extend({
    init: function(theName, isAI, game){
        this._super(theName, true, game);        
    },

    pickPieces : function (game) {              //this just picks random amounts for each category
        var pieces = game.numStartingChips;
        for (var x=0; x < game.numQualities - 1; x++) {
            var value = Math.floor(Math.random()*pieces+0);
            var secret = {"quality": game.qualities[x].name,"value":value};
            this.secrets.push(secret);
            if (pieces > 0) { pieces -= value;}
        }
        if (pieces > 0) {
            var lastSecret = {"quality": game.qualities[game.numQualities-1].name, "value" : pieces}
            this.secrets.push(lastSecret);
        }
    },

    takeTurn : function (game) {        //all bots need to have this function
        this.makeMove(game);
    },

    pry: function (game)  {
    //Decide who to pry, and then pry them

        var randomIndex = Math.floor(Math.random()*game.players.length+0);          //pick a random target
        var target = game.players[randomIndex].name;
        
        var nonZeroQualities = [];                  //grab all your qualities you have chips in
        for (var x in this.secrets) {
            if (this.secrets[x].value > 0) { nonZeroQualities.push(x); }
        }

        if (nonZeroQualities.length == 0) {         //if you're completely out of chips, wait and watch
            this.waitWatch();
        }

        randomIndex = Math.floor(Math.random()*nonZeroQualities.length+0);          //pick a random quality to use
        var qualityUsed = this.secrets[nonZeroQualities[randomIndex]].quality;

        var amountUsed = Math.floor(Math.random()*this.secrets[nonZeroQualities[randomIndex]].value+1);     //pick a random amount

        console.log(this.name + " pryed " + target + " with " + amountUsed + " " + qualityUsed + "!");

        var outcome = game.pryTurn(this.name, target, qualityUsed, amountUsed);            //take action
        
        //deal with info from outcome here
    },

    parry: function (game) {
    //defend, or reply, to an pry. Decide what you will defend with and defend


        
    },

    barterInfo: function (game) {
    //barter info with another player. You give info, in return for info. If your info is more exact, you earn trust

        var randomIndex = Math.floor(Math.random()*game.players.length+0);
        var target = game.players[randomIndex].name;

        var infoGiven;

        console.log(this.name + " bartered info with " + target + ", and offered info of...", infoGiven);
        
        var outcome = game.barterTurn();

        //deal with info from outcome here
    },

    waitWatch: function (game) {
    //pass your turn, but the next action that's taken will be known to you in its full

        console.log(this.name + " is biding their time.");

        var outcome = game.waitWatch();

        //deal with info from outcome here
    },

    makeMove: function(game){
        //this is where strategy should happen, but randomBot just chooses randomly

        var actionChoice = Math.floor(Math.random()*3+1);         //pick a number between 1 and 3
        var target = Math.floor(Math.random()*3+0);

        switch (actionChoice) {
            case 1:
                this.pry(game);
                break;
            case 2:
                this.barterInfo(game);
                break;
            case 3:
                this.waitWatch(game);
        }
    }
});

//-----------------------------------------------------------------------------
/*
var SimpleBot = Player.extend({
    init: function(name){
        this._super(name, true);
        this.playerModels = [];     //current models of what you think other players have
    },

    pick
    takeTurn : function (game) {        //all bots need to have this function

        for (var x=0; x < game.numPlayers.length -1; x++) {     //evaluate players and update their info
            this.evaluatePlayer();
        }
        this.makeMove();

    },
    evaluatePlayer : function () {
        //do some evaluation stuff
        this.updatePlayerInfo();
    },

    updatePlayerInfo : function() {

    },

    makeMove : function() {
        var choice = Math.floor(Math.random()*3+1);         //pick a number between 1 and 3

            switch (choice) {
                case 1:
                    this.pry("something","something",5);
                    break;
                case 2:
                    this.barterInfo("something","something");
                    break;
                case 3:
                    this.waitWatch();
            }
    }
});
*/