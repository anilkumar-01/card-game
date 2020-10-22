class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }
}
class Deck {
    constructor() {
        this.cards = [];    
    }      
    createDeck() {
        let suits = ['clubs', 'diamonds', 'hearts', 'spades'];
        let ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9','10', 'jack', 'queen', 'king'];
        let values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
        for (let i = 0; i < suits.length; i++) {
            for (let j = 0; j < ranks.length; j++) {
                this.cards.push(new Card(suits[i], ranks[j], values[j]));
            }
        }
    }
    shuffleDeck() {
       let location1, location2, tmp;
       for (let i = 0; i < 1000; i++) {
           location1 = Math.floor((Math.random() * this.cards.length));
           location2 = Math.floor((Math.random() * this.cards.length));
           tmp = this.cards[location1];
           this.cards[location1] = this.cards[location2];
           this.cards[location2] = tmp;
        }
    }
}
class Player {
    constructor(name) {
        this.playerName = name;
        this.playerCards = [];
        this.cardBreakdown = {}
        this.playerResult = null
    }
    createBreakdown(){
        // creating an array of only values to check for winning conditions
        let cardValues = this.playerCards.map(oneCard => oneCard.value)

        // Helper function includes logic for pair and sequence check
        // breakdown cards check for a player 
        this.cardBreakdown.triplePairCheck = Helper.triplePairCheck(cardValues)
        this.cardBreakdown.sequenceNumberCheck = Helper.sequenceNumberCheck(cardValues)
        let [isDoublePair,doublePairCard] = Helper.doublePairCheck(cardValues)
        this.cardBreakdown.doublePairCheck = isDoublePair
        
        // if double pair is true then make double pair card as top card 
        // (this will be used to decide winner if two or more player have double pair)
        if (isDoublePair) {
            this.cardBreakdown.topCard = doublePairCard
        }else{
            this.cardBreakdown.topCard = Helper.topCard(cardValues)
        }
        // player result is the winning rank of a player for his cards (lower the index higher winning chance)
        this.playerResult = Helper.getResult(this.cardBreakdown)
    }
}

const winningRank = ["Triple Pair","Sequence Cards","Double Pair","High Card"]

// this will only be used if a tie happens.
var remainingPlayers = [];
var remainingDeck = {};

const Helper = {
    triplePairCheck : (cards) =>{
        let triplePair = true
        if (cards[0] !== cards[1] || cards[0] !== cards[2]) {
            triplePair = false
        }
        return triplePair
    },
    sequenceNumberCheck : (cards) =>{
        let numberSequence = true
        const sortedNumber = cards.sort((a, b) => a - b);
        for (let i = 1; i < sortedNumber.length; i++) {
            if (sortedNumber[i - 1] != sortedNumber[i] - 1) {
                numberSequence = false;
            }
        }
        return numberSequence;
    },
    doublePairCheck: (cards) =>{
        let doublePair = false
        let doublePairCard = null
        for (let i = 0; i < cards.length; i++) {
            if (countNumber(cards,cards[i]) === 2) {
                doublePair = true
                doublePairCard = cards[i]
            }
        }
        return [doublePair,doublePairCard]
    },

    topCard: (cards) =>{
        return Math.max(...cards)
    },

    getResult:(cardBreakdown)=>{
        // return an index number according to player cards. Lower the index ,higher the position
        if (cardBreakdown.triplePairCheck) {
            return 0
        } else if (cardBreakdown.sequenceNumberCheck){
            return 1
        } else if (cardBreakdown.doublePairCheck){
            return 2
        } else {
            return 3
        }
    }
}

// helper functions

// count a given number in an array
const countNumber = (array,specificNumber) => {
    return array.filter(n => n == specificNumber).length
}

// get all keys from an object for given value (this is used to get all players with same value)
// it will return multiple players in case of tie else the winner
const getKeysByValue = (object, value) => {
    let matchingKeys = []
    
    Object.keys(object).map(key => {
        if ((object[key] === value)) {
            matchingKeys.push(key)
        }
    });
    return matchingKeys
}

// this function is used to decide winner from high card, if its a tie return result as tie
const decideWinner = (playerCards,deck) =>{
    let maxValue = Math.max(...Object.values(playerCards))
    let winners = getKeysByValue(playerCards,maxValue)
    console.log("winners",winners);
    if (winners.length === 1) {
        return {
            result:'win', 
            message:`Player : ${winners[0]} wins the game with High Card : ${maxValue}`
        }
    } else {
        console.log("Remaining Players:",winners);
        return {
            result:'tie',
            message: `It's a tie with high card b/w ${winners}`, 
            remainingPlayers: winners,
            remainingDeck: deck
        }
    }
}

// this function is used to draw a new card for each of the players in faceoff round
// since we have only card per player the winner is decided with high card (so high card function is used as return for this)
const faceOffRound = () =>{
    let newPlayerCards ={} 

    // create ui for the remaining players 
    createPlayersUI(remainingPlayers)
    
    for (let i = 0; i < remainingPlayers.length; i++) {
        
        let newCard = remainingDeck.cards.splice(0,1);
        
        // render card in ui
        renderCard(newCard, i);
        newPlayerCards[remainingPlayers[i]] = newCard[0].value
        console.log("New Card For Player:",remainingPlayers[i], ", Card:",newCard);
    }
    console.log("player cards value in face off",newPlayerCards);
    
    //this will update the remaining card number in ui
    updateDeck(remainingDeck.cards)

    return decideWinner(newPlayerCards)
}

// this is game board. Game starts from here.
class Board {
    constructor() {
        this.deck = new Deck();
        this.players = [];
    }
    
    // helper function to get player cards with given name
    getPlayerCardsWithName(playerName) {
        
        return (this.players.filter(onePlayer => onePlayer.playerName === playerName))[0]
    }

    // this function is used to decide a winner needs to be decided from high cards
    // this will get the top card from player class and pass it to decidewinner function
    decideWinnerFromTopCard(remainingPlayers,deck){
        console.log("remainingPlayers",remainingPlayers);
        let topCards = {}
        this.players.map(onePlayer =>{
            if (remainingPlayers.includes(onePlayer.playerName)) {
                topCards[onePlayer.playerName] = onePlayer.cardBreakdown.topCard   
            }
        })
        console.log("top cards:",topCards);
        return decideWinner(topCards,deck)   
    }
    
    // start the game by creating players and assinging the 3 cards each 
    start(playerOneName, playerTwoName,playerThreeName,playerFourName) {
        // create players
        this.players.push(new Player(playerOneName));
        this.players.push(new Player(playerTwoName));
        this.players.push(new Player(playerThreeName));
        this.players.push(new Player(playerFourName));
        
        // creating and shuffling new deck
        this.deck.createDeck();
        this.deck.shuffleDeck();
        
        // it will create ui for players
        createPlayersUI(this.players)

        // distribute 3 cards to all players (since we have already shuffled no need to distribute with round)
        for (let i = 0; i < 4; i++) {
            this.players[i].playerCards = this.deck.cards.splice(0, 3);
            this.players[i].createBreakdown()

            // this will render all three cards to specific player's ui
            renderCard(this.players[i].playerCards, i);
        }
        // update the remaing card number in ui
        updateDeck(this.deck.cards)
        
        // get player results from player class (it will be used to declare players rank)
        const playerResults = {}
        this.players.map(onePlayer =>{
            console.log("Player Cards are :",onePlayer.playerName, onePlayer.playerCards);
            playerResults[onePlayer.playerName] = onePlayer.playerResult
        })

        // decalre result
        // check if all have high card as their best combination
        if (Object.values(playerResults).every( val => val === 3 )) {
            return this.decideWinnerFromTopCard(Object.keys(playerResults),this.deck)
        }else{
            // now in else it means that atleast one player has three pair or sequence or two pair
            // minimum index value wins the game
            let minValueIndex = Math.min(... Object.values(playerResults))
            
            // get all players with minimum index
            let winners = getKeysByValue(playerResults,minValueIndex)
            
            // if its only one then that is winner
            if (winners.length === 1) {
                
                let winningCards = this.getPlayerCardsWithName(winners[0]).playerCards
                console.log("winning cards",winningCards);
                return {result: 'win',message: `Player : ${winners[0]} wins the game with ${winningRank[minValueIndex]}`}
            } else {
                // else it's tie between all matching players

                console.log(`It's a tie with with ${winningRank[minValueIndex]} b/w ${winners}`);
                // check for high card between tie players
                // eg: (3,3,3) and (5,5,5) then second player will win
                // eg: (6,6,4) and (2,2,7) then first player will win (note that for double pair we set top card as double pair card value)
                let topCardResult = this.decideWinnerFromTopCard(winners,this.deck)

                if (topCardResult.result === 'tie') {
                    return {result: 'tie', message: `It's a tie with ${winningRank[minValueIndex]} b/w ${winners}`, remainingPlayers: winners, remainingDeck:this.deck}
                }else{
                    return {result: 'win',message: `It's a tie with ${winningRank[minValueIndex]} b/w ${winners} but ${topCardResult.message}`}
                }
            }
        }
    }
}

const startTheGame = () =>{
    //Restart option is enabled now
    document.getElementById('btnStart').style.display="none";
    document.getElementById('btnRestart').style.display="inline-block";
    document.getElementById("status").style.display="none";
    
    // start the game with four players
    let gameBoard = new Board();
    let gameResult = gameBoard.start('A', 'B','C','D')

    // display result
    document.getElementById('status').innerHTML = gameResult.message;
    document.getElementById("status").style.display = "inline-block";
    
    // enable faceoff button if it's tie
    if (gameResult.result === 'tie') {
        // restart button is disabled and face off button is enabled
        document.getElementById('btnRestart').style.display = "none";
        document.getElementById("btnStartFaceOff").style.display="inline-block";

        // send remainging players to global variable
        remainingPlayers = gameResult.remainingPlayers
        remainingDeck = gameResult.remainingDeck
    }else{
        // this means game is won by any player. empty the list of remaining player
        remainingPlayers = []
        remainingDeck = {}
    }
}
function restartTheGame() {
    // ask for confirmation  before restarting the game
    // comment out swal part and call startTheGame function directly for faster simulation of game
    swal("The Game will restart", {
        buttons: {
            cancel: "Cancel",
            ok: "Continue"
        }
      }).then(value =>{
        //   console.log("value from swal",value);
        // start game if user confirms
          if (value === 'ok') {
            startTheGame()
          }
      });
      // startTheGame()
}

// this function used to decide winner when game result is tie
function startFaceOffRound() {
    document.getElementById("status").style.display="none";
    
    // get result with new cards
    let gameResult = faceOffRound()
    
    // display result
    document.getElementById('status').innerHTML = gameResult.message;
    document.getElementById("status").style.display = "inline-block";
    
    if (gameResult.result === 'tie') {
        // send remainging players to global variable
        remainingPlayers = gameResult.remainingPlayers
        remainingDeck = gameResult.remainingDeck

    }else{
        // in else game is won any one of the players. Enable Restart button and hide face off button
        document.getElementById('btnRestart').style.display = "inline-block";
        document.getElementById("btnStartFaceOff").style.display="none";
        
        // since game is over empty remaining player list and deck
        remainingPlayers = []
        remainingDeck = {}
    }

}

// this function is used to create player's ui. This will create a box which will display the player cards
function createPlayersUI(players){
    document.getElementById('players').innerHTML = '';
    
    // creates div for each player 
    for(var i = 0; i < players.length; i++)
    {
        var div_player = document.createElement('div');
        var div_playerid = document.createElement('div');
        var div_hand = document.createElement('div');

        // creating div id as per player index so that it can be used later to identify the player and render cards
        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;
        
        var playerName = (players[i].playerName)?players[i].playerName : players[i]

        div_playerid.innerHTML = 'Player ' + playerName;
        div_player.appendChild(div_playerid);
        div_player.appendChild(div_hand);
        document.getElementById('players').appendChild(div_player);
    }
}

// this function will render cards in ui to a specific player
function renderCard(cards, player){
    // get corresponding div with player index
    var hand = document.getElementById('hand_' + player);
    cards.map(card =>{
        hand.appendChild(getCardUI(card));
    })
}

// create card div based on it's suit
function getCardUI(card){
    var el = document.createElement('div');
    var icon = '';
    if (card.suit == 'hearts')
    icon='&hearts;';
    else if (card.suit == 'spades')
    icon = '&spades;';
    else if (card.suit == 'diamonds')
    icon = '&diams;';
    else
    icon = '&clubs;';
    
    el.className = 'card';
    el.innerHTML = card.value + '<br/>' + icon;
    return el;
}

// update the number for remaining cards in deck and display in ui
function updateDeck(deck){
    document.getElementById('deckcount').innerHTML = deck.length;
}