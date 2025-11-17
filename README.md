# blackjacksko26_table8

A full-stack web application for playing Blackjack with user authentication and game history tracking.

## Features

- User registration and login system
- Secure password hashing with bcrypt
- JWT-based authentication
- Interactive Blackjack game (Player vs Dealer)
- Game history stored in SQLite database
- Responsive React frontend
- RESTful API backend with Express

## Tech Stack

**Frontend:**
- React
- CSS3

**Backend:**
- Node.js
- Express
- SQLite3
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

## Running the Application

### Option 1: Run both servers concurrently (Recommended)

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Option 2: Run servers separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account with your first name, last name, email, and password
3. Login with your credentials
4. Start playing Blackjack!

## Game Rules

- The goal is to get as close to 21 as possible without going over
- Face cards (J, Q, K) are worth 10 points
- Aces can be worth 1 or 11 points
- Number cards are worth their face value
- Click "Hit" to draw another card
- Click "Stand" to end your turn and let the dealer play
- Dealer must hit until reaching 17 or higher
- Win by having a higher score than the dealer without busting (going over 21)

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/user` - Get current user info (requires authentication)

### Game
- `POST /api/game/start` - Start a new game
- `POST /api/game/hit` - Draw a card
- `POST /api/game/stand` - End turn and let dealer play
- `POST /api/game/save` - Save game result
- `GET /api/game/history` - Get user's game history

## Database Schema

### Users Table
- id (INTEGER PRIMARY KEY)
- firstName (TEXT)
- lastName (TEXT)
- email (TEXT UNIQUE)
- password (TEXT - hashed)
- createdAt (DATETIME)

### Game History Table
- id (INTEGER PRIMARY KEY)
- userId (INTEGER)
- playerHand (TEXT - JSON)
- dealerHand (TEXT - JSON)
- result (TEXT)
- playerScore (INTEGER)
- dealerScore (INTEGER)
- playedAt (DATETIME)

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 24 hours
- All game endpoints require authentication
- CORS is enabled for development

## Future Enhancements

- Betting system with virtual chips
- Multiplayer support
- Game statistics and leaderboards
- Sound effects and animations
- Mobile app version

## License

MIT