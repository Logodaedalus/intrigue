var Player = Class.extend({                 //the default player (human-controlled)
    init: function(theName, type, game){
        this.name = theName;
        this.type = type;           //this can be "human", "bot", or "model"
        this.secrets = [];          //this is the qualities along with their values  { "quality" : "time", "value" : [23,25] }
        this.players = [];          //current model of players, {"name": "playerName", secrets : [secrets array]
        this.autoplay = false;

        if (type !== "model") {     //if it's not a mental model, initialize it
            this.pickPieces(game);
            //this.populatePlayerModel(game);
        }
    },
    
    populatePlayerModel : function (game) {
    /*
    Starting assumptions: other players have some number of chips in qualities that can't be higher than the total number of chips
    */

        for (var x in game.players) {

            var playerCopy = new Player(game.players[x].name, false, game);         //create a player for their model of the player
            var secretsInfo = [];

            for (var y in game.qualities) {
                playerCopy.secrets.push({"quality" : game.qualities[y].name, "value" : [0, game.numStartingChips]});
            }

            this.players.push(playerCopy);                //add this to the mental model of the player
        }
    },
    pickPieces : function (game) {          //for now, this just assigns random pieces
        var pieces = game.numStartingChips;
        for (var x=0; x < game.numQualities - 1; x++) {
            var value = Math.floor(Math.random()*pieces+0);
            var secret = {"quality": game.qualities[x].name,"value":[value,value]};
            this.secrets.push(secret);
            if (pieces > 0) { pieces -= value;}
        }
        if (pieces > 0) {
            var lastSecret = {"quality": game.qualities[game.numQualities-1].name, "value" : [pieces,pieces]}
            this.secrets.push(lastSecret);
        }
    },
    takeTurn : function (game) {        //all players need to have this function
        
    },

    pry: function (game)  {
    //pry a player. You have a target you're prying (string), the quality you're using to pry (string), and the amount you're using (int)
        var target;
        var qualityUsed;
        var amountUsed;

        $('#' + playerIndex + 'Action ul').append("<li>" + this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!</li>");

        console.log(this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!</li>");

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
    init: function(theName, type, game){
        this._super(theName, "bot", game);       
        this.autoplay = true; 
    },

    pickPieces : function (game) {              //this just picks random amounts for each category
        var pieces = game.numStartingChips;
        for (var x=0; x < game.numQualities - 1; x++) {
            var value = Math.floor(Math.random()*pieces+0);
            var secret = {"quality": game.qualities[x].name,"value":[value,value]};
            this.secrets.push(secret);
            if (pieces > 0) { pieces -= value;}
        }
        if (pieces > 0) {
            var lastSecret = {"quality": game.qualities[game.numQualities-1].name, "value" : [pieces,pieces]}
            this.secrets.push(lastSecret);
        }
    },

    takeTurn : function (game) {        //all bots need to have this function

        //not sure what should happen here. Possibly any pre-processing before doing strategy to determine a move?
        this.makeMove(game);
    },

    pry: function (game)  {
    //Decide who to pry, and then pry them

        var randomIndex = Math.floor(Math.random()*game.players.length+0);          //pick a random target
        var target = game.players[randomIndex].name;
        
        var nonZeroQualities = [];                  //grab all your qualities you have chips in
        for (var x in this.secrets) {
            if (this.secrets[x].value[0] > 0) { nonZeroQualities.push(x); }
        }

        if (nonZeroQualities.length == 0) {         //if you're completely out of chips, wait and watch
            this.waitWatch(game);
        }

        randomIndex = Math.floor(Math.random()*nonZeroQualities.length+0);          //pick a random quality to use
        var qualityUsed = this.secrets[nonZeroQualities[randomIndex]].quality;

        var amountUsed = Math.floor(Math.random()*this.secrets[nonZeroQualities[randomIndex]].value[0]+1);     //pick a random amount

        $('#' + this.name + 'Action ul').append("<li>Round "+ game.currentRound + ": " + this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!</li>");
        console.log(this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!");

        console.log(this.name + "'s " + qualityUsed + " = " + this.secrets[nonZeroQualities[randomIndex]].value[0]);
        var outcome = game.pryTurn(this.name, target, qualityUsed, amountUsed);            //take action
        console.log("it was a " + outcome.result + "! " + this.name + "'s " + qualityUsed + " now = " + this.secrets[nonZeroQualities[randomIndex]].value[0]);
        
        //deal with info from outcome here
    },

    parry: function (game, attacker, quality, amount) {
    //defend against a pry action. Decide what you will defend with and defend

        var nonZeroQualities = [];                  //grab all your qualities you have chips in
        for (var x in this.secrets) {
            if (this.secrets[x].value[0] > 0) { nonZeroQualities.push(x); }
        }

        randomIndex = Math.floor(Math.random()*nonZeroQualities.length+0);          //pick a random quality to use
        var qualityUsed = this.secrets[nonZeroQualities[randomIndex]].quality;
        var amountUsed = Math.floor(Math.random()*this.secrets[nonZeroQualities[randomIndex]].value[0]+1);     //pick a random amount

        return ({"quality" : qualityUsed, "amountUsed" : amountUsed});
        
    },

    barterInfo: function (game) {
    //barter info with another player. You give info, in return for info. If your info is more exact, you earn trust

        var randomIndex = Math.floor(Math.random()*game.players.length+0);
        var target = game.players[randomIndex].name;

        var infoGiven;

        $('#' + this.name + 'Action ul').append("<li>Round "+ game.currentRound + ": " + this.name + " bartered info with " + target);
        console.log(this.name + " bartered info with " + target + ", and offered info of...", infoGiven);
        
        var outcome = game.barterTurn();

        //deal with info from outcome here
    },

    waitWatch: function (game) {
    //pass your turn, but the next action that's taken will be known to you in its full

        $('#' + this.name + 'Action ul').append("<li>Round "+ game.currentRound + ": " + this.name + " bided their time.");
        console.log(this.name + " bided their time.");

        var outcome = game.waitWatch();

        //deal with info from outcome here
    },

    makeMove: function(game){
        //this is where strategy should happen, but randomBot just chooses randomly

        var actionChoice = Math.floor(Math.random()*3+1);         //pick a number between 1 and 3

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