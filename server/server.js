import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flashcard-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB Models
const deckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  created_at: { type: Date, default: Date.now }
});

const flashcardSchema = new mongoose.Schema({
  deck_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Deck', required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: String,
  hint: String,
  image: String, // Store filename as string
  created_at: { type: Date, default: Date.now }
});

const Deck = mongoose.model('Deck', deckSchema);
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'flashcard-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// API Routes

// Get all decks
app.get('/api/decks', async (req, res) => {
  try {
    const decks = await Deck.find().sort({ created_at: -1 });
    
    // Get card counts for each deck
    const decksWithCounts = await Promise.all(
      decks.map(async (deck) => {
        const cardCount = await Flashcard.countDocuments({ deck_id: deck._id });
        return {
          _id: deck._id,
          name: deck.name,
          description: deck.description,
          created_at: deck.created_at,
          card_count: cardCount
        };
      })
    );
    
    res.json(decksWithCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// Create a new deck
app.post('/api/decks', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Deck name is required' });
    }
    
    const deck = new Deck({
      name,
      description: description || ''
    });
    
    await deck.save();
    
    res.status(201).json({
      _id: deck._id,
      name: deck.name,
      description: deck.description,
      created_at: deck.created_at,
      card_count: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deck' });
  }
});

// Get a specific deck
app.get('/api/decks/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    const cardCount = await Flashcard.countDocuments({ deck_id: deck._id });
    
    res.json({
      _id: deck._id,
      name: deck.name,
      description: deck.description,
      created_at: deck.created_at,
      card_count: cardCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
});

// Delete a deck
app.delete('/api/decks/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    // Delete all flashcards in this deck first
    const flashcards = await Flashcard.find({ deck_id: deck._id });
    
    // Delete image files for all flashcards in this deck
    for (const card of flashcards) {
      if (card.image) {
        const imagePath = path.join(uploadsDir, card.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }
    
    await Flashcard.deleteMany({ deck_id: deck._id });
    
    // Then delete the deck
    await Deck.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deck' });
  }
});

// Get flashcards for a deck
app.get('/api/decks/:id/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ deck_id: req.params.id }).sort({ created_at: -1 });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get flashcard by ID
app.get('/api/flashcards/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcard' });
  }
});

// Create a new flashcard
app.post('/api/flashcards', async (req, res) => {
  try {
    const { deck_id, question, answer, category, hint } = req.body;
    
    if (!deck_id || !question || !answer) {
      return res.status(400).json({ error: 'Deck ID, question, and answer are required' });
    }
    
    // Verify deck exists
    const deck = await Deck.findById(deck_id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    const flashcard = new Flashcard({
      deck_id,
      question,
      answer,
      category: category || '',
      hint: hint || ''
    });
    
    await flashcard.save();
    
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// Update a flashcard
app.put('/api/flashcards/:id', async (req, res) => {
  try {
    const { question, answer, category, hint } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }
    
    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer,
        category: category || '',
        hint: hint || ''
      },
      { new: true } // Return updated document
    );
    
    if (!updatedFlashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    res.json(updatedFlashcard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete a flashcard
app.delete('/api/flashcards/:id', async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // Delete image file if exists
    if (flashcard.image) {
      const imagePath = path.join(uploadsDir, flashcard.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Flashcard.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

// Get categories for a deck
app.get('/api/decks/:id/categories', async (req, res) => {
  try {
    const categories = await Flashcard.distinct('category', { 
      deck_id: req.params.id,
      category: { $ne: '', $exists: true }
    });
    res.json(categories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get flashcards by category
app.get('/api/decks/:id/flashcards/category/:category', async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ 
      deck_id: req.params.id,
      category: req.params.category 
    }).sort({ created_at: -1 });
    
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcards by category' });
  }
});

// Export deck with all flashcards
app.get('/api/decks/:id/export', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    
    const flashcards = await Flashcard.find({ deck_id: deck._id });
    
    const exportData = {
      deck: {
        name: deck.name,
        description: deck.description,
        created_at: deck.created_at
      },
      flashcards: flashcards.map(card => ({
        question: card.question,
        answer: card.answer,
        category: card.category,
        hint: card.hint,
        created_at: card.created_at
      })),
      export_date: new Date().toISOString(),
      version: '1.0'
    };
    
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export deck' });
  }
});

// Import deck from JSON
app.post('/api/decks/import', async (req, res) => {
  try {
    const { deckData, flashcardsData } = req.body;
    
    if (!deckData || !deckData.name) {
      return res.status(400).json({ error: 'Invalid deck data' });
    }
    
    // Create new deck
    const newDeck = new Deck({
      name: deckData.name,
      description: deckData.description || ''
    });
    
    await newDeck.save();
    
    // Create flashcards
    if (flashcardsData && flashcardsData.length > 0) {
      const flashcards = flashcardsData.map(cardData => ({
        deck_id: newDeck._id,
        question: cardData.question,
        answer: cardData.answer,
        category: cardData.category || '',
        hint: cardData.hint || ''
      }));
      
      await Flashcard.insertMany(flashcards);
    }
    
    // Get the complete deck with card count
    const cardCount = await Flashcard.countDocuments({ deck_id: newDeck._id });
    const completeDeck = {
      _id: newDeck._id,
      name: newDeck.name,
      description: newDeck.description,
      created_at: newDeck.created_at,
      card_count: cardCount
    };
    
    res.status(201).json(completeDeck);
  } catch (error) {
    res.status(500).json({ error: 'Failed to import deck' });
  }
});

// IMAGE ENDPOINTS

// Upload image for a flashcard
app.post('/api/flashcards/:id/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      // Delete the uploaded file since flashcard doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // If there was a previous image, delete it
    if (flashcard.image) {
      const oldImagePath = path.join(uploadsDir, flashcard.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update flashcard with image filename
    flashcard.image = req.file.filename;
    await flashcard.save();

    res.json({
      message: 'Image uploaded successfully',
      filename: req.file.filename
    });
  } catch (error) {
    // Delete the uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Remove image from flashcard
app.delete('/api/flashcards/:id/image', async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    if (flashcard.image) {
      // Delete the image file
      const imagePath = path.join(uploadsDir, flashcard.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Remove image reference from flashcard
      flashcard.image = null;
      await flashcard.save();
    }

    res.json({ message: 'Image removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove image' });
  }
});

// Serve uploaded images
app.get('/api/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Send the image file
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: error.message });
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Uploads directory: ${uploadsDir}`);
});