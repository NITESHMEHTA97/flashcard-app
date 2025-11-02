import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { flashcardAPI } from '../services/api';
import FlashcardImage from '../components/FlashcardImage';

export default function StudyPage() {
  const { deckId } = useParams();
  const [searchParams] = useSearchParams();
  const categories = searchParams.getAll('categories');
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFlashcards();
    // Reset card index and answer state when deck or categories change
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setShowHint(false);
  }, [deckId, categories.join(',')]); // Re-run when deckId or categories change

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Pass categories as query parameters if they exist
      const params = {};
      if (categories.length > 0) {
        params.categories = categories;
      }
      
      const response = await flashcardAPI.getByDeck(deckId, { params });
      const cards = response.data;
      
      if (cards.length === 0) {
        const message = categories.length > 0 
          ? 'No flashcards found in the selected categories.'
          : 'No flashcards available in this deck.';
        setError(message);
        return;
      }
      
      // Shuffle flashcards for study mode
      const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffledCards);
      
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      setError('Failed to load flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentCardIndex];

  const handleNext = () => {
    setShowAnswer(false);
    setShowHint(false);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Reached the end - show completion
      alert(`🎉 Study session complete! You've reviewed all ${flashcards.length} cards.`);
      navigate(`/deck/${deckId}`);
    }
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setShowHint(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading flashcards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <div className="flex justify-center gap-4">
          <button 
            onClick={loadFlashcards}
            className="btn btn-primary"
          >
            Try Again
          </button>
          <Link 
            to={`/deck/${deckId}`}
            className="btn btn-outline"
          >
            Back to Deck
          </Link>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">No cards available</h2>
        <Link to={`/deck/${deckId}`} className="btn btn-primary">
          Back to Deck
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Study Mode</h1>
          {categories.length > 0 && (
            <p className="text-gray-600 mt-1">
              Filtered by {categories.length} {categories.length === 1 ? 'category' : 'categories'}
            </p>
          )}
        </div>
        <Link 
          to={`/deck/${deckId}`} 
          className="btn btn-outline"
        >
          ← Back to Deck
        </Link>
      </div>

      <div className="card max-w-2xl mx-auto text-center">
        {/* Progress and Category */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-600">
            Card {currentCardIndex + 1} of {flashcards.length}
          </span>
          {currentCard.category && (
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
              {currentCard.category}
            </span>
          )}
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {currentCard.question}
          </h2>
          
          {/* Answer (revealed on click) */}
          {showAnswer ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 text-lg font-medium mb-2">Answer:</p>
              <p className="text-green-700 text-xl mb-4">{currentCard.answer}</p>
              
              {/* Flashcard Image - Only show when answer is revealed */}
              {currentCard.image && (
                <div className="mt-4 flex justify-center">
                  <FlashcardImage 
                    flashcard={currentCard}
                    size="md"
                  />
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={toggleAnswer}
              className="btn btn-primary text-lg py-3 px-8"
            >
              👆 Click to Reveal Answer
            </button>
          )}
        </div>

        {/* Hint */}
        {currentCard.hint && !showHint && !showAnswer && (
          <div className="mb-6">
            <button 
              onClick={toggleHint}
              className="btn btn-outline text-sm"
            >
              💡 Show Hint
            </button>
          </div>
        )}

        {currentCard.hint && showHint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">
              💡 Hint: {currentCard.hint}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
          <button 
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="btn btn-outline flex-1 max-w-32 disabled:opacity-50"
          >
            ← Previous
          </button>
          
          <button 
            onClick={handleNext}
            className="btn btn-primary flex-1 max-w-32"
          >
            {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}