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
        let cardValues = this.playerCards.map(oneCard => oneCard.value)

        this.cardBreakdown.triplePairCheck = Helper.triplePairCheck(cardValues)
        this.cardBreakdown.sequenceNumberCheck = Helper.sequenceNumberCheck(cardValues)
        let [isDoublePair,doublePairCard] = Helper.doublePairCheck(cardValues)
        this.cardBreakdown.doublePairCheck = isDoublePair
        
        // if double pair is true then make double pair card as top card 
        // (this will be used to decide winned if two or more player have double pair)
        if (isDoublePair) {
            this.cardBreakdown.topCard = doublePairCard
        }else{
            this.cardBreakdown.topCard = Helper.topCard(cardValues)
        }

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

const countNumber = (array,specificNumber) => {
    return array.filter(n => n == specificNumber).length
}

const getKeysByValue = (object, value) => {
    let matchingKeys = []
    
    Object.keys(object).map(key => {
        if ((object[key] === value)) {
            matchingKeys.push(key)
        }
    });
    return matchingKeys
}

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

const faceOffRound = () =>{
    let newPlayerCards ={} 

    createPlayersUI(remainingPlayers)
    
    for (let i = 0; i < remainingPlayers.length; i++) {
        
        let newCard = remainingDeck.cards.splice(0,1);
        
        renderCard(newCard, i);
        newPlayerCards[remainingPlayers[i]] = newCard[0].value
        console.log("New Card For Player:",remainingPlayers[i], ", Card:",newCard);
    }
    console.log("player cards value in face off",newPlayerCards);
    updateDeck(remainingDeck.cards)

    return decideWinner(newPlayerCards)
}

// this is our game board.
class Board {
    constructor() {
        this.deck = new Deck();
        this.players = [];
    }

    getPlayerCardsWithName(playerName) {
        
        return (this.players.filter(onePlayer => onePlayer.playerName === playerName))[0]
    }
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

    start(playerOneName, playerTwoName,playerThreeName,playerFourName) {
        // create players
        this.players.push(new Player(playerOneName));
        this.players.push(new Player(playerTwoName));
        this.players.push(new Player(playerThreeName));
        this.players.push(new Player(playerFourName));
        
        // creating and shuffling new deck
        this.deck.createDeck();
        this.deck.shuffleDeck();
        
        // distribute 3 cards to all players (since we have already shuffled no need to distribute with round)
        createPlayersUI(this.players)
        for (let i = 0; i < 4; i++) {
            this.players[i].playerCards = this.deck.cards.splice(0, 3);
            this.players[i].createBreakdown()
            renderCard(this.players[i].playerCards, i);
        }
        updateDeck(this.deck.cards)
        // check for cards
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
            let minValueIndex = Math.min(... Object.values(playerResults))
            // console.log("min",minValueIndex);
            let winners = getKeysByValue(playerResults,minValueIndex)
            // console.log("winners",winners);
            if (winners.length === 1) {
                
                let winningCards = this.getPlayerCardsWithName(winners[0]).playerCards
                console.log("winning cards",winningCards);
                return {result: 'win',message: `Player : ${winners[0]} wins the game with ${winningRank[minValueIndex]}`}
            } else {
                console.log(`It's a tie with with ${winningRank[minValueIndex]} b/w ${winners}`);
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
    // Give Restart option
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
        document.getElementById('btnRestart').style.display = "none";
        document.getElementById("btnStartFaceOff").style.display="inline-block";

        // send remainging players to global variable
        remainingPlayers = gameResult.remainingPlayers
        remainingDeck = gameResult.remainingDeck
    }else{
        remainingPlayers = []
        remainingDeck = {}
    }
}
function restartTheGame() {

    swal("The Game will restart", {
        buttons: {
            cancel: "Cancel",
            ok: "Continue"
        }
      }).then(value =>{
          console.log("value from swal",value);
          if (value === 'ok') {
            startTheGame()
          }
      });
}
function startFaceOffRound() {
    document.getElementById("status").style.display="none";
    
    let gameResult = faceOffRound()
    // display result
    document.getElementById('status').innerHTML = gameResult.message;
    document.getElementById("status").style.display = "inline-block";
    
    // enable faceoff button if it's tie
    if (gameResult.result === 'tie') {

        // send remainging players to global variable
        remainingPlayers = gameResult.remainingPlayers
        remainingDeck = gameResult.remainingDeck

    }else{
        document.getElementById('btnRestart').style.display = "inline-block";
        document.getElementById("btnStartFaceOff").style.display="none";
        remainingPlayers = []
        remainingDeck = {}
    }

}
function createPlayersUI(players){
    document.getElementById('players').innerHTML = '';
    for(var i = 0; i < players.length; i++)
    {
        var div_player = document.createElement('div');
        var div_playerid = document.createElement('div');
        var div_hand = document.createElement('div');
        var div_points = document.createElement('div');

        div_points.className = 'points';
        div_points.id = 'points_' + i;
        div_player.id = 'player_' + i;
        div_player.className = 'player';
        div_hand.id = 'hand_' + i;
        console.log("players[i].playerName",players[i],players[i].playerName);
        var playerName = (players[i].playerName)?players[i].playerName : players[i]
        div_playerid.innerHTML = 'Player ' + playerName;
        div_player.appendChild(div_playerid);
        div_player.appendChild(div_hand);
        div_player.appendChild(div_points);
        document.getElementById('players').appendChild(div_player);
    }
}

function renderCard(cards, player){

    var hand = document.getElementById('hand_' + player);
    cards.map(card =>{
        hand.appendChild(getCardUI(card));
    })
}

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

function updateDeck(deck){
    document.getElementById('deckcount').innerHTML = deck.length;
}