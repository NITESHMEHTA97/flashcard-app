import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { flashcardAPI } from '../services/api';

export default function CategoryFilterPage() {
  const { deckId } = useParams();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [deckId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all flashcards
      const flashcardsResponse = await flashcardAPI.getByDeck(deckId);
      const flashcards = flashcardsResponse.data;
      setAllFlashcards(flashcards);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(flashcards.map(card => card.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    
    if (category === selectedCategory) {
      // Deselecting - show all flashcards
      setFilteredFlashcards(allFlashcards);
    } else {
      // Selecting - filter flashcards
      const filtered = allFlashcards.filter(card => card.category === category);
      setFilteredFlashcards(filtered);
    }
  };

  const handleStudyCategory = () => {
    if (filteredFlashcards.length === 0) {
      alert('No flashcards in this category to study.');
      return;
    }
    
    // For now, navigate to study page (we'll enhance this later to filter by category)
    navigate(`/deck/${deckId}/study`);
  };

  const displayFlashcards = selectedCategory ? filteredFlashcards : allFlashcards;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <div className="flex justify-center gap-4">
          <button 
            onClick={loadData}
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Filter by Category</h1>
        <Link to={`/deck/${deckId}`} className="btn btn-outline">
          ← Back to Deck
        </Link>
      </div>

      {/* Categories Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        
        {categories.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">No categories found.</p>
            <p className="text-sm text-gray-500">
              Add categories to your flashcards to filter them.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 rounded-full border-2 transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {category}
                <span className="ml-2 text-xs opacity-75">
                  ({allFlashcards.filter(card => card.category === category).length})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Flashcards Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategory ? `Flashcards in "${selectedCategory}"` : 'All Flashcards'}
            <span className="text-gray-600 text-lg ml-2">
              ({displayFlashcards.length})
            </span>
          </h2>
          
          {selectedCategory && (
            <button 
              onClick={handleStudyCategory}
              className="btn btn-primary"
              disabled={filteredFlashcards.length === 0}
            >
              Study This Category
            </button>
          )}
        </div>

        {displayFlashcards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">
              {selectedCategory 
                ? `No flashcards found in category "${selectedCategory}".`
                : 'No flashcards found in this deck.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayFlashcards.map(card => (
              <div key={card._id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold text-gray-800 mb-2">{card.question}</h3>
                <p className="text-gray-600 mb-3">{card.answer}</p>
                <div className="flex justify-between items-center">
                  {card.category && (
                    <span className="inline-block bg-primary text-white px-2 py-1 rounded text-sm">
                      {card.category}
                    </span>
                  )}
                  {card.hint && (
                    <span className="text-sm text-gray-500 italic">
                      💡 Hint: {card.hint}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}