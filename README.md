# Flashcard Application

A full-stack flashcard application built with React, Vite, Node.js, Express, and MongoDB. Create, study, and manage your flashcards with ease.

## Features

- 🃏 Create and manage multiple flashcard decks
- 📝 Add, edit, and delete flashcards
- 🔄 Import/Export decks in JSON format
- 🎨 Clean and responsive user interface
- ⚡ Fast and efficient with React and Vite

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Build Tool**: Vite

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd flashcard-app
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3001
MONGODB_URI=mongodb://localhost:27017/flashcard-app

# Client (optional)
REACT_APP_API_URL=http://localhost:3001/api
```

### 4. Start the development servers

#### Option 1: Run both client and server with a single command (recommended for development)

```bash
npm run dev
```

#### Option 2: Run client and server separately

In the root directory:

```bash
# Start the backend server
node server/server.js

# In a new terminal, start the frontend development server
cd client
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build the client application for production
- `npm run build-client` - Build only the client application
- `npm start` - Start the production server (after building)

## Project Structure

```
flashcard-app/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── services/      # API services
│       └── App.jsx        # Main App component
├── server/                # Backend server
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── server.js         # Express server setup
├── .env                  # Environment variables
└── README.md             # This file
```

## API Endpoints

- `GET /api/decks` - Get all decks
- `POST /api/decks` - Create a new deck
- `GET /api/decks/:id` - Get a single deck with its cards
- `PUT /api/decks/:id` - Update a deck
- `DELETE /api/decks/:id` - Delete a deck
- `GET /api/decks/:id/export` - Export a deck as JSON
- `POST /api/decks/import` - Import a deck from JSON
- `POST /api/decks/:deckId/cards` - Add a card to a deck
- `PUT /api/decks/:deckId/cards/:cardId` - Update a card
- `DELETE /api/decks/:deckId/cards/:cardId` - Delete a card

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request
