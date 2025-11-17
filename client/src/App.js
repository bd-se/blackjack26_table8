import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

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
        <h1>Blackjack Game</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.firstName} {user.lastName}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>
      <Game token={token} />
    </div>
  );
}

export default App;
