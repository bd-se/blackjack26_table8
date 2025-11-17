import React, { useState } from 'react';
import './Game.css';

function Game({ token, onGameComplete }) {
  const [gameState, setGameState] = useState(null);
  const [deck, setDeck] = useState([]);
  const [fullDealerHand, setFullDealerHand] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const startNewGame = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/game/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setGameState(data);
      setDeck(data.deck || []);
      setFullDealerHand(data.fullDealerHand || data.dealerHand);
      
      if (data.playerScore === 21) {
        setMessage('Blackjack! You win!');
        await saveGame(data, 'win');
      }
    } catch (error) {
      setMessage('Error starting game');
    } finally {
      setLoading(false);
    }
  };

  const hit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/game/hit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deck: deck,
          playerHand: gameState.playerHand,
          dealerHand: fullDealerHand
        })
      });

      const data = await response.json();
      setGameState(data);
      setDeck(data.deck || []);
      if (data.fullDealerHand) {
        setFullDealerHand(data.fullDealerHand);
      }

      if (data.gameOver) {
        if (data.result === 'lose') {
          setMessage('Bust! You lose.');
        }
        await saveGame(data, data.result);
      }
    } catch (error) {
      setMessage('Error processing hit');
    } finally {
      setLoading(false);
    }
  };

  const stand = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/game/stand', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deck: deck,
          playerHand: gameState.playerHand,
          dealerHand: fullDealerHand
        })
      });

      const data = await response.json();
      setGameState(data);

      if (data.result === 'win') {
        setMessage('You win!');
      } else if (data.result === 'lose') {
        setMessage('Dealer wins!');
      } else {
        setMessage('Push! It\'s a tie.');
      }

      await saveGame(data, data.result);
    } catch (error) {
      setMessage('Error processing stand');
    } finally {
      setLoading(false);
    }
  };

  const saveGame = async (data, result) => {
    try {
      await fetch('http://localhost:5000/api/game/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerHand: data.playerHand,
          dealerHand: data.dealerHand,
          result: result,
          playerScore: data.playerScore,
          dealerScore: data.dealerScore
        })
      });
      // Notify parent component that game is complete
      if (onGameComplete) {
        onGameComplete();
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const renderCard = (card) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className={`card ${isRed ? 'red' : 'black'}`}>
        <div className="card-value">{card.value}</div>
        <div className="card-suit">{card.suit}</div>
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="game-board">
        {!gameState ? (
          <div className="start-screen">
            <h2>Ready to play Blackjack?</h2>
            <button onClick={startNewGame} className="start-btn" disabled={loading}>
              {loading ? 'Starting...' : 'Start New Game'}
            </button>
          </div>
        ) : (
          <>
            <div className="dealer-section">
              <h3>Dealer's Hand {gameState.dealerScore !== null && `(${gameState.dealerScore})`}</h3>
              <div className="hand">
                {gameState.dealerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            <div className="player-section">
              <h3>Your Hand ({gameState.playerScore})</h3>
              <div className="hand">
                {gameState.playerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
            </div>

            {message && <div className="game-message">{message}</div>}

            <div className="game-controls">
              {!gameState.gameOver ? (
                <>
                  <button onClick={hit} disabled={loading} className="action-btn">
                    Hit
                  </button>
                  <button onClick={stand} disabled={loading} className="action-btn">
                    Stand
                  </button>
                </>
              ) : (
                <button onClick={startNewGame} disabled={loading} className="action-btn">
                  New Game
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Game;