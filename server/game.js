const db = require('./database');

// Card deck
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Create a deck of cards
const createDeck = () => {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

// Shuffle deck
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Calculate hand value
const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      aces += 1;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

// Start new game
const startGame = (req, res) => {
  const deck = shuffleDeck(createDeck());
  
  const playerHand = [deck.pop(), deck.pop()];
  const dealerHand = [deck.pop(), deck.pop()];

  const gameState = {
    deck,
    playerHand,
    dealerHand,
    playerScore: calculateHandValue(playerHand),
    dealerScore: calculateHandValue(dealerHand),
    gameOver: false,
    result: null
  };

  res.json({
    playerHand,
    dealerHand: [dealerHand[0], { suit: '?', value: '?' }], // Hide dealer's second card
    fullDealerHand: dealerHand, // Send full dealer hand for later use
    playerScore: gameState.playerScore,
    deck: deck,
    gameOver: false
  });
};

// Hit - player draws a card
const hit = (req, res) => {
  let { deck, playerHand, dealerHand } = req.body;

  console.log('Hit request received. Deck type:', typeof deck, 'Is array:', Array.isArray(deck), 'Deck length:', deck?.length);

  if (!deck || !playerHand || !dealerHand) {
    return res.status(400).json({ error: 'Invalid game state' });
  }

  // Ensure deck is an array and create a proper copy
  if (!Array.isArray(deck)) {
    console.error('Deck is not an array:', deck);
    return res.status(400).json({ error: 'Deck must be an array' });
  }

  // Create a proper array copy to ensure it has array methods
  deck = [...deck];
  playerHand = [...playerHand];
  dealerHand = [...dealerHand];

  const newCard = deck.pop();
  playerHand.push(newCard);
  const playerScore = calculateHandValue(playerHand);

  let gameOver = false;
  let result = null;

  if (playerScore > 21) {
    gameOver = true;
    result = 'lose';
  }

  res.json({
    playerHand,
    dealerHand: gameOver ? dealerHand : [dealerHand[0], { suit: '?', value: '?' }],
    fullDealerHand: dealerHand,
    playerScore,
    dealerScore: gameOver ? calculateHandValue(dealerHand) : null,
    deck: deck,
    gameOver,
    result
  });
};

// Stand - dealer plays
const stand = (req, res) => {
  let { deck, playerHand, dealerHand } = req.body;

  if (!deck || !playerHand || !dealerHand) {
    return res.status(400).json({ error: 'Invalid game state' });
  }

  // Ensure deck is an array and create a proper copy
  if (!Array.isArray(deck)) {
    return res.status(400).json({ error: 'Deck must be an array' });
  }

  // Create a proper array copy to ensure it has array methods
  deck = [...deck];
  playerHand = [...playerHand];
  dealerHand = [...dealerHand];

  const playerScore = calculateHandValue(playerHand);
  let dealerScore = calculateHandValue(dealerHand);

  // Dealer draws until 17 or higher
  while (dealerScore < 17) {
    dealerHand.push(deck.pop());
    dealerScore = calculateHandValue(dealerHand);
  }

  let result;
  if (dealerScore > 21) {
    result = 'win';
  } else if (playerScore > dealerScore) {
    result = 'win';
  } else if (playerScore < dealerScore) {
    result = 'lose';
  } else {
    result = 'push';
  }

  res.json({
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
    deck: deck,
    gameOver: true,
    result
  });
};

// Save game to history
const saveGame = (req, res) => {
  const { playerHand, dealerHand, result, playerScore, dealerScore } = req.body;
  const userId = req.userId;

  const sql = `INSERT INTO game_history (userId, playerHand, dealerHand, result, playerScore, dealerScore) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [
    userId,
    JSON.stringify(playerHand),
    JSON.stringify(dealerHand),
    result,
    playerScore,
    dealerScore
  ], function(err) {
    if (err) {
      console.error('Error saving game:', err);
      return res.status(500).json({ error: 'Failed to save game', details: err.message });
    }
    res.json({ success: true, gameId: this.lastID });
  });
};

// Get game history
const getHistory = (req, res) => {
  const userId = req.userId;

  const sql = 'SELECT * FROM game_history WHERE userId = ? ORDER BY playedAt DESC LIMIT 10';
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
    res.json(rows);
  });
};

module.exports = { startGame, hit, stand, saveGame, getHistory };