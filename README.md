# Intrigue

To start, just open intrigue.html in your browser

# Game Description

* Players start out with some number of "chips" in some number of "categories"
* Turn-based
* On each round, a player can either
 * Pry
 * Barter Info
 * Wait and Watch

**Pry** - a player uses some number of chips in some category to inquire about another players category. That player must put some number of chips from that category in as well, if they have them. Whoever has more chips wins. The winner adds half the other players' chips to their category. The other half are returned to them. Whoever has the most currently in the winning quality gets a chip (if pryer wins, a chip goes to that person in addition to the pryer's reward).

**Barter** - a player can submit info to another player in the hope of getting info back. Info is the form of "player 2 has between 4 and 6 chips in this quality". The higher the precision, the better the trade. A series of bad trades will bias the player to not want to trade with you.

**Wait** - a player can pass their turn and specify a player to watch. The next pry action involving that player will have its details made known to that player.

## Winning ##
After all rounds are complete, each player guesses how many chips each other player has in their category. After everyone's guessed, whoever has the category with the highest error (in chips, not %) between guesses and actual values, wins.

# Planned Bots
**Random bot** - establishes a baseline...makes random decisions for everything in the game

**Regret bot** - uses counter-factual regret minimization to choose moves from a MCTS-style tree (tests to identify strategy for pure-approach bots below)

**Pry bot** - always inquires about other players

**Watch bot** - always passes turns to watch other players

**Barter bot** - barters info about self and then bootstraps to other players info but only barters

**Mix bot** - has a policy for choosing strategy between prying, watching, and bartering based on situation (domain knowledge)
