import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { deckAPI, flashcardAPI } from '../services/api';
import FlashcardImage from '../components/FlashcardImage';


export default function DeckDetailPage() {
  const { deckId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deckId) {
      loadDeckAndFlashcards();
    }
  }, [deckId]);

  const loadDeckAndFlashcards = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load deck details
      const deckResponse = await deckAPI.getById(deckId);
      setDeck(deckResponse.data);
      dispatch({ type: 'SET_CURRENT_DECK', payload: deckResponse.data });
      
      // Load flashcards for this deck
      const flashcardsResponse = await flashcardAPI.getByDeck(deckId);
      setFlashcards(flashcardsResponse.data);
      dispatch({ type: 'SET_FLASHCARDS', payload: flashcardsResponse.data });
      
    } catch (error) {
      console.error('Failed to load deck:', error);
      setError('Failed to load deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlashcard = async (flashcardId, question) => {
    if (window.confirm(`Are you sure you want to delete flashcard: "${question}"?`)) {
      try {
        await flashcardAPI.delete(flashcardId);
        
        // Update local state
        setFlashcards(prev => prev.filter(card => card._id !== flashcardId));
        
        // Update deck card count
        if (deck) {
          setDeck(prev => ({ ...prev, card_count: prev.card_count - 1 }));
        }
        
        alert('Flashcard deleted successfully!');
      } catch (error) {
        alert('Failed to delete flashcard. Please try again.');
      }
    }
  };

  const getCategories = () => {
    const categories = [...new Set(flashcards.map(card => card.category).filter(Boolean))];
    return categories;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading deck...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <button 
          onClick={loadDeckAndFlashcards}
          className="btn btn-primary mr-4"
        >
          Try Again
        </button>
        <Link to="/" className="btn btn-outline">
          Back to Decks
        </Link>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Deck not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to Decks
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Deck Info Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{deck.name}</h1>
            <p className="text-gray-600 mb-4">{deck.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>{deck.card_count || 0} cards</span>
              <span>Created: {new Date(deck.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <Link to="/" className="btn btn-outline">
            ← Back to Decks
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
          <Link 
            to={`/deck/${deckId}/study`} 
            className={`btn btn-primary ${flashcards.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              if (flashcards.length === 0) {
                e.preventDefault();
                alert('Add some flashcards to this deck first!');
              }
            }}
          >
            Study Deck
          </Link>
          <Link 
            to={`/deck/${deckId}/create-card`}
            className="btn btn-secondary"
          >
            + Add Flashcard
          </Link>
          <Link 
            to={`/deck/${deckId}/categories`}
            className={`btn btn-outline ${getCategories().length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              if (getCategories().length === 0) {
                e.preventDefault();
                alert('No categories available. Add categories to your flashcards first.');
              }
            }}
          >
            Filter by Category
          </Link>
        </div>
      </div>

      {/* Flashcards List */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Flashcards ({flashcards.length})
          </h2>
          {flashcards.length > 0 && (
            <div className="text-sm text-gray-600">
              {getCategories().length > 0 && `${getCategories().length} categories`}
            </div>
          )}
        </div>

        {flashcards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No flashcards yet!
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first flashcard to start studying this deck.
            </p>
            <Link 
              to={`/deck/${deckId}/create-card`}
              className="btn btn-primary"
            >
              + Add First Flashcard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {flashcards.map((card) => (
              <div key={card._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 flex-1">
                      {card.question}
                    </h3>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/deck/${deckId}/edit-card/${card._id}`}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteFlashcard(card._id, card.question)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Category and Hint in one line */}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    {card.category && (
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Category:</span>
                        <span className="bg-primary text-white px-2 py-0.5 rounded text-sm">
                          {card.category}
                        </span>
                      </div>
                    )}
                    
                    {card.hint && (
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-1">Hint:</span>
                        <span className="text-gray-800 italic">{card.hint}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer and Image in one line */}
                <div className="flex flex-row gap-4">
                  {/* Answer - takes remaining space */}
                  <div className="bg-gray-50 p-4 rounded-lg flex-1">
                    <p className="text-sm text-gray-600 mb-1">Answer:</p>
                    <p className="text-gray-800">{card.answer}</p>
                  </div>
                  
                  {/* Image - extra small size */}
                  {card.image && (
                    <div className="flex items-center justify-center w-10 h-8 flex-shrink-0">
                      <FlashcardImage 
                        flashcard={card}
                        size="xs"
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-3">
                  Created: {new Date(card.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}