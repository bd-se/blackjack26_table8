import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import Stats from './components/Stats';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState('game');
  const [statsKey, setStatsKey] = useState(0);

  const handleGameComplete = () => {
    // Force stats component to refresh by changing its key
    setStatsKey(prev => prev + 1);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [token, handleLogout]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  if (!token) {
    return (
      <div className="App">
        {showRegister ? (
          <Register 
            onRegister={handleLogin}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🥊 Blackjack Arena</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.firstName} {user.lastName}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>
      
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🎮 Play Game
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Fight Record
        </button>
      </div>

      {activeTab === 'game' ? (
        <Game token={token} onGameComplete={handleGameComplete} />
      ) : (
        <Stats key={statsKey} token={token} />
      )}
    </div>
  );
}

export default App;
