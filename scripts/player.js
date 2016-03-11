var Player = Class.extend({                 //the default player (human-controlled)
    init: function(theName, type, game){
        this.name = theName;
        this.type = type;           //this can be "human", "bot", or "model"
        this.secrets = [];          //this is the qualities along with their values  { "quality" : "time", "value" : [23,25] }
        this.players = [];          //current model of players, {"name": "playerName", secrets : [secrets array]
        this.autoplay = false;

        if (type !== "model") {     //if it's not a mental model, initialize it
            this.pickPieces(game);
        }
    },
    
    populatePlayerModel : function (game) {
    /* Starting assumptions: other players have some number of chips in qualities that can't be higher than the total number of chips */

        for (var x=0; x < game.players.length; x++) {

            var playerCopy = new Player(game.players[x].name, false, game);         //create a player for their model of the player
            playerCopy.secrets = [];        //clear secrets
            var secretsInfo = [];

            for (var y=0; y < game.qualities.length; y++) {
                playerCopy.secrets.push({"quality" : game.qualities[y].name, "value" : [0, game.numStartingChips]});
            }

            this.players.push(playerCopy);                //add this to the mental model of the player
        }
    },
    pickPieces : function (game) {          //for now, this just assigns random pieces
        var pieces = game.numStartingChips;
        for (var x=0; x < game.numQualities - 1; x++) {             //for every category except last, pick random value
            var value = getRandom(0,pieces);
            var secret = {"quality": game.qualities[x].name,"value":[value,value]};
            this.secrets.push(secret);
            if (pieces > 0) { pieces -= value;}
        }
        var lastSecret = {"quality": game.qualities[game.numQualities-1].name, "value" : [pieces,pieces]}   //put all remaining chips in last category
        this.secrets.push(lastSecret);
    },
    takeTurn : function (game) {        //all players need to have this function
        
    },

    pry: function (game)  {
    //pry a player. You have a target you're prying (string), the quality you're using to pry (string), and the amount you're using (int)
        var target;
        var qualityUsed;
        var amountUsed;

        $('#' + playerIndex + 'Action ul').append("<li>" + this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!</li>");

        game.consoleLog(2, this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!</li>");

        var outcome = game.pryTurn();            //take action
        
        //deal with info from outcome here
    },

    barterInfo: function (game) {
    //barter info with another player. You give info, in return for info. If your info is more exact, you earn trust

        var target;
        var infoGiven;

        consoleLog(2, this.name + " bartered info with " + target + ", and offered info of...", infoGiven);
        
        var outcome = game.barterTurn();

        //deal with info from outcome here
    },

    updatePlayerModel: function (player, quality, low, high) {         //this should maybe add stuff to a list of facts?
        for (var x=0; x < this.players.length; x++) {
            if (this.players[x].name == player) {
                for (var y=0; y < this.players[x].secrets.length; y++) {
                    if (this.players[x].secrets[y][0] < low) { this.players[x].secrets[y][0] = low; }
                    if (this.players[x].secrets[y][1] > high) { this.players[x].secrets[y][1] = high; }
                }
            }
        }
    },


    waitWatch: function (game) {
    //pass your turn, but the next action that's taken will be known to you in its full

        consoleLog(2, this.name + " is biding their time.");

        var outcome = game.waitWatch();

        //deal with info from outcome here
    },

    getGuess: function (player, quality) {      //returns the player's guess about the other player's quality

    },

    getNumChips: function() {
        var numChips = 0;

        for (var x=0; x < this.secrets.length; x++) {
            numChips += this.secrets[x].value[0];
        }

        if (numChips == 0) { consoleLog(3, this.name + " has no chips left!")}
        return numChips;
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
        for (var x=0; x < game.numQualities - 1; x++) {         //pick random vals for all but last category
            var value = getRandom(0,pieces);
            var secret = {"quality": game.qualities[x].name,"value":[value,value]};
            this.secrets.push(secret);
            if (pieces > 0) { pieces -= value;}
        }
        
        var lastSecret = {"quality": game.qualities[game.numQualities-1].name, "value" : [pieces,pieces]}       //put all remaining chips in last quality
        this.secrets.push(lastSecret);
    },

    takeTurn : function (game) {        //all bots need to have this function

        //not sure what should happen here. Possibly any pre-processing before doing strategy to determine a move?
        this.makeMove(game);
    },

    pry: function (game)  {
    //Decide who to pry, and then pry them
        var randomIndex;
        do {
            randomIndex = getRandom(0, game.players.length - 1);                    //pick a random target that is not yourself
        } while (game.players[randomIndex].name == this.name);
        var target = game.players[randomIndex].name;
        
        var nonZeroQualities = [];                  //grab all your qualities you have chips in
        for (var x in this.secrets) {
            if (this.secrets[x].value[0] > 0) { nonZeroQualities.push(x); }
        }

        if (nonZeroQualities.length == 0) {         //if you're completely out of chips, wait and watch
            this.waitWatch(game);
        }

        randomIndex = getRandom(0, nonZeroQualities.length-1);            //pick a random quality to use
        var qualityUsed = this.secrets[nonZeroQualities[randomIndex]].quality;

        var amountUsed = getRandom(1, this.secrets[nonZeroQualities[randomIndex]].value[0]);        //pick a random amount

        $('#' + this.name + 'Action ul').append("<li>Round "+ game.currentRound + ": " + this.name + " pried " + target + " with " + amountUsed + " " + qualityUsed + "!</li>");
        
        consoleLog(2, this.name + " pried " + target + " with " + amountUsed + "/" + this.secrets[nonZeroQualities[randomIndex]].value[0] + " " + qualityUsed + "!");

        var outcome = game.pryTurn(this.name, target, qualityUsed, amountUsed);            //take action

        consoleLog(3, this.name + "'s " + qualityUsed + " now = " + this.secrets[nonZeroQualities[randomIndex]].value[0]);
        
        consoleLog(3, "updating attacker's model of defender...");
        this.updatePlayerModel(outcome.fact);        //update our model of the player
    },

    parry: function (game, attacker, quality, amount) {    //defend against a pry action. Decide what you will defend with and defend

        var nonZeroQualities = [];                  //grab all your qualities you have chips in
        for (var x in this.secrets) {
            if (this.secrets[x].value[0] > 0) { nonZeroQualities.push(x); }
        }

        randomIndex = getRandom(0, nonZeroQualities.length - 1);             //pick a random quality to use
        var qualityUsed;
        var amountUsed;
        if (nonZeroQualities.length > 0) {      //if they still have chips left...
            qualityUsed = this.secrets[nonZeroQualities[randomIndex]].quality;
            amountUsed = getRandom(1,this.secrets[nonZeroQualities[randomIndex]].value[0]);         //pick a random amount
            consoleLog(3, this.name + " defended with " + amountUsed + "/" + this.secrets[nonZeroQualities[randomIndex]].value[0] + " " + qualityUsed);
        }
        else {
            qualityUsed = this.secrets[getRandom(0,this.secrets.length-1)].quality;
            amountUsed = 0;
            consoleLog(3, this.name + " had nothing to defend with! So they used zero of " + qualityUsed);
        }

        return ({"quality" : qualityUsed, "amountUsed" : amountUsed});
        
    },

    barterInfo: function (game) {
    //barter info with another player. You give info, in return for info. If your info is more exact, you earn trust

        var randomIndex = getRandom(0, game.players.length-1);
        var target = game.players[randomIndex].name;

        var infoGiven;

        $('#' + this.name + 'Action ul').append("<li>Round "+ game.currentRound + ": " + this.name + " bartered info with " + target);
        consoleLog(2, this.name + " bartered info with " + target + ", and offered info of...", infoGiven);
        
        var outcome = game.barterTurn();

        //deal with info from outcome here
    },

    waitWatch: function (game) {
    //pass your turn, but the next action that's taken will be known to you in its full

        var randomIndex = getRandom(0, game.players.length-1);
        var target = game.players[randomIndex].name;

        $('#' + this.name + 'Action ul').append("<li>Round "+ game.currentRound + ": " + this.name + " bided their time.");
        consoleLog(2, this.name + " bided their time.");

        game.waitWatch(this.name, target);

        //deal with info from outcome here
    },

    updatePlayerModel: function (theFact) {         //this function updates a player's model with new info

        //if either of the values are -1, that means don't update it. Otherwise, if it increases precision update it!
        var newLow = theFact.value[0];
        var newHigh = theFact.value[1];

        for (var x=0; x < this.players.length; x++) {       //find the player
            if (this.players[x].name == theFact.player) {
                for (var y=0; y < this.players[x].secrets.length; y++) {
                    if (this.players[x].secrets[y].quality == theFact.quality) {       //when we find the matching quality in their model...
                        
                        var oldLow = this.players[x].secrets[y].value[0];
                        var oldHigh = this.players[x].secrets[y].value[1]

                        consoleLog(3, this.name + "'s model of " + this.players[x].name + "'s " + this.players[x].secrets[y].quality + " was somewhere between " + oldLow + " and " + oldHigh);
                        if (oldLow < newLow && newLow !== -1) { 
                            
                            this.players[x].secrets[y].value[0] = newLow;           //if it's higher precision, update!
                            if (newLow > oldHigh) {             //we are horribly off in where we should be for high
                                this.players[x].secrets[y].value[1] = newLow + 10;      //make the new high arbitrarily high
                            }    
                            
                        }
                        if (oldHigh > newHigh && newHigh !== -1) { 
                            this.players[x].secrets[y].value[1] = newHigh;          //if it's higher precision, update!
                        }
                        consoleLog(3, "-----it is now somewhere between " + this.players[x].secrets[y].value[0] + " and " + this.players[x].secrets[y].value[1]);
                    }
                }
            }
        }
        
    },

    finalGuess: function (player, quality) {         //return an array object with the guesses for each quality
        //for randomBot it's just going to pick a random number somewhere in the range it knows

        var playerModel = $.grep(this.players, function (h) { return h.name == player.name })[0];
        var qualityRange = $.grep(playerModel.secrets, function (h) { return h.quality == quality })[0].value;
        var guess = getRandom(qualityRange[0], qualityRange[1]);        //pick a random number in range of what you know
        
        consoleLog(3, "------" + this.name + " guesses some number between " + qualityRange[0] + " and " + qualityRange[1] + ": " + guess);
        return guess;
    },

    makeMove: function(game){        //this is where strategy should happen, but randomBot just chooses randomly
        var actionChoice;
        if (this.getNumChips() > 0) {
            var actionChoice = getRandom(1,3)                       //pick a number between 1 and 3    
        }
        else {
            var actionChoice = getRandom(2,3)           ;         //pick a number between 1 and 3
        }
        

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
var fsicrBot = RandomBot.extend({
    init: function(theName, type, game){
        this._super(theName, "bot", game);       
        this.autoplay = true; 
    },

    takeTurn : function (game) {                //evaluate stuff and then choose a move
        this.makeMove();

    },

    pickpieces : function() {                   //pick pieces at beginning of game

    },

    waitWatch : function() {                    //wait and watch a player

    },

    barterInfo : function() {                   //trade info with other players

    },

    pry : function() {                          //use chips to discover info about other players

    },

    parry : function() {                        //response to a pry function

    },

    updatePlayerModel : function() {            //update info about other players

    },

    finalGuess : function () {                  //make final guess about other bots

    },

    makeMove : function() {         //choose a move function to trigger and do that

    }

    
});

//-----------------------------------------------------------------------------
/*
Implemented "regret matching and minimization" from Neller / Lanctot's "An Introduction to Counterfactual Regret Minimization" (http://modelai.gettysburg.edu/2013/cfr/cfr.pdf)
*/
var regretMatchingBot = RandomBot.extend({
    init: function(theName, type, game){
        this._super(theName, "bot", game);       
        this.autoplay = true; 

        this.pryVal = 0;            //list of actions the bot can take
        this.barterVal = 1;
        this.waitwatchVal = 2;

        this.otherAction;
        this.myAction;
        this.numActions = 3;                         //rounds??? Might actually be the number of actions to strategize about
        this.regretSum = [];                     //this is an array of numbers (doubles) the length of numActions
        this.strategy = [];                      //this is an array of numbers (doubles) the length of numActions
        this.strategySum = [];                   //this is an array of numbers (doubles) the length of numActions
        this.oppStrategy = [0.5, 0.3, 0.2 ];         //the initial weights for opponent choices
    },
    /*takeTurn : function (game) {                //evaluate stuff and then choose a move
        this.makeMove();

    },

    pickpieces : function() {                   //pick pieces at beginning of game

    },

    waitWatch : function() {                    //wait and watch a player

    },

    barterInfo : function() {                   //trade info with other players

    },

    pry : function() {                          //use chips to discover info about other players

    },

    parry : function() {                        //response to a pry function

    },

    updatePlayerModel : function() {            //update info about other players

    },

    finalGuess : function () {                  //make final guess about other bots

    },
*/
    getStrategy : function() {          //Get current mixed strategy through regret-matching
    //Regret-matching selects actions in proportion to positive regrets of not having chosen them in the past.
        var normalizingSum = 0;
        for (var a = 0; a < this.numActions; a++) {     //we begin by first copying all positive regrets and summing them
            this.strategy[a] = this.regretSum[a] > 0 ? this.regretSum[a] : 0;
            normalizingSum += this.strategy[a];
        }
        for (var a = 0; a < this.numActions; a++) {     //We then make a second pass through the strategy entries
            if (normalizingSum > 0) {                   //If there is at least one action with positive regret...
                this.strategy[a] /= normalizingSum;         //we normalize the regrets by dividing by our normalizing sum of positive regrets
            }
            else {      //Note that the normalizing sum could be non-positive. In such cases, we make the strategy uniform, giving each action an equal probability (1.0 / NUM ACTIONS)
                this.strategy[a] = 1.0 / this.numActions;
            }

            //To normalize in this context means that we ensures that array entries sum to 1 and thus represent probabilities of the corresponding actions in the computed mixed strategy.

            this.strategySum[a] += this.strategy[a];
        }
        return this.strategy;            //this is a double[]
    },

    getAction : function(strategy) {            //Get random action according to mixed-strategy distribution
        var r = Math.random();
        var a = 0;
        var cumulativeProbability = 0;
        while (a < this.numActions - 1) {
            cumulativeProbability += strategy[a];
            if (r < cumulativeProbability)
                break;
            a++;
        }
        return a;       //this is an int
    },

    train : function(iterations) {                          //Train
        var actionUtility = [];                             //an array of doubles of length numActions
        for (var i = 0; i < iterations; i++) {
            this.getRegretMixedStratAct();                       //Get regret-matched mixed-strategy actions
            this.computeActionUtil(actionUtility);               //Compute action utilities
            this.accumulateActionRegrets(actionUtility);             //Accumulate action regrets
        }
    },

    getRegretMixedStratAct : function() {           //Get regret-matched mixed-strategy actions
        var strategy = this.getStrategy();               //an array of doubles
        var myAction = this.getAction(strategy);         //an int
        var otherAction = this.getAction(this.oppStrategy);   //an int
    },

    computeActionUtil : function(actionUtility) {               //Compute action utilities
        //TODO: this section needs actual utilities...right now totally broken!
        actionUtility[this.otherAction] = 0;
        actionUtility[this.otherAction == this.numActions - 1 ? 0 : this.otherAction + 1] = 1;
        actionUtility[this.otherAction == 0 ? this.numActions - 1 : this.otherAction - 1] = -1;
    },

    accumulateActionRegrets : function(actionUtility) {         //Accumulate action regrets
        for (var a = 0; a < this.numActions; a++) {
            this.regretSum[a] += actionUtility[a] - actionUtility[this.myAction];
        }
    },

    getAverageStrategy : function() {                  //Get average mixed strategy across all training iterations
        var avgStrategy = [];                         //array of doubles, of length numActions
        var normalizingSum = 0;
        for (var a = 0; a < this.numActions; a++)
            normalizingSum += this.strategySum[a];
        for (var a = 0; a < this.numActions; a++)
            if (normalizingSum > 0)
                avgStrategy[a] = this.strategySum[a] / normalizingSum;
            else
                avgStrategy[a] = 1.0 / this.numActions;
        return avgStrategy;         //this is a double[]
    },

    initComputation : function(args) {         //takes an array of strings as arg
        this.train(1000);                     //could be one million?
        console.log("the strategy is: " + this.getAverageStrategy());
        return this.getAverageStrategy();

    },

    makeMove : function(game) {         //choose a move function to trigger and do that
        this.getStrategy();
        this.getAction(this.strategy); 
        this.train();
        this.getAverageStrategy();        //Get average mixed strategy across all training iterations
        var thisTurnStrat = this.initComputation();

        var actions = [this.pry(game),this.barterInfo(game), this.waitWatch(game)];

        getWeightedRandomItem(actions, thisTurnStrat);
    }
    
});

//-----------------------------------------------------------------------------
/*
var TemplateBot = Player.extend({
    init: function(name){
        this._super(name, true);
        this.autoplay = true;
    },
    takeTurn : function (game) {                //evaluate stuff and then choose a move
        this.makeMove();

    },

    pickpieces : function() {                   //pick pieces at beginning of game

    },

    waitWatch : function() {                    //wait and watch a player

    },

    barterInfo : function() {                   //trade info with other players

    },

    pry : function() {                          //use chips to discover info about other players

    },

    parry : function() {                        //response to a pry function

    },

    updatePlayerModel : function() {            //update info about other players

    },

    finalGuess : function () {                  //make final guess about other bots

    },

    makeMove : function() {         //choose a move function to trigger and do that

    }

    
});
*/
