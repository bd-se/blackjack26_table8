const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { register, login, verifyToken } = require('./auth');
const { startGame, hit, stand, saveGame, getHistory } = require('./game');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Auth routes
app.post('/api/register', register);
app.post('/api/login', login);

// Game routes (protected)
app.post('/api/game/start', verifyToken, startGame);
app.post('/api/game/hit', verifyToken, hit);
app.post('/api/game/stand', verifyToken, stand);
app.post('/api/game/save', verifyToken, saveGame);
app.get('/api/game/history', verifyToken, getHistory);

// Get user info
app.get('/api/user', verifyToken, (req, res) => {
  const db = require('./database');
  db.get('SELECT id, firstName, lastName, email FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});