import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { flashcardAPI } from '../services/api';
import { FiX, FiChevronDown, FiCheck } from 'react-icons/fi';

export default function CategoryFilterPage() {
  const { deckId } = useParams();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [allFlashcards, setAllFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [deckId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await flashcardAPI.getByDeck(deckId);
      const flashcards = response.data || [];
      setAllFlashcards(flashcards);
      
      const categoryMap = flashcards.reduce((acc, card) => {
        if (card.category) {
          acc[card.category] = (acc[card.category] || 0) + 1;
        }
        return acc;
      }, {});
      
      const sortedCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      
      setCategories(sortedCategories);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection/deselection
  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      updateFilteredFlashcards(newSelection);
      return newSelection;
    });
  };

  // Update filtered flashcards based on selected categories
  const updateFilteredFlashcards = useCallback((categories) => {
    if (categories.length === 0) {
      setFilteredFlashcards(allFlashcards);
    } else {
      const filtered = allFlashcards.filter(card => 
        categories.includes(card.category)
      );
      setFilteredFlashcards(filtered);
    }
  }, [allFlashcards]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, categories.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(-1, prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < categories.length) {
          toggleCategory(categories[focusedIndex][0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories based on search query
  const filteredCategories = categories.filter(([category]) => 
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayFlashcards = selectedCategories.length > 0 ? filteredFlashcards : allFlashcards;

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Filter by Category</h1>
        <Link to={`/deck/${deckId}`} className="btn btn-outline">
          ← Back to Deck
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="card mb-8">
        <div className="relative w-full" ref={dropdownRef}>
          {/* Search Input Row */}
          <div 
            className={`flex items-center p-2 border rounded-lg ${
              showDropdown ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-300'
            }`}
            onClick={() => {
              setShowDropdown(true);
              searchInputRef.current?.focus();
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search categories..."
              className="w-full p-2 border-0 focus:ring-0 focus:outline-none text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
            />
            
            {/* Dropdown Toggle */}
            <button 
              className="text-gray-500 hover:text-gray-700 p-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <FiChevronDown className={`text-xl transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Selected Filters */}
          {selectedCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <span 
                  key={category}
                  className="inline-flex items-center px-3 py-1.5 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                >
                  {category}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                    className="ml-2 text-primary-600 hover:text-primary-900"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ width: '100%' }}>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(([category, count], index) => (
                  <div
                    key={category}
                    className={`group flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                      focusedIndex === index ? 'bg-gray-100' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div className={`w-5 h-5 border rounded mr-3 flex-shrink-0 flex items-center justify-center ${
                      selectedCategories.includes(category) 
                        ? 'bg-primary-500 border-primary-500 text-white' 
                        : 'border-gray-400 group-hover:border-primary-300'
                    }`}>
                      {selectedCategories.includes(category) && <FiCheck size={14} />}
                    </div>
                    <span className="flex-1 font-medium">{category}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-3">{count} {count === 1 ? 'card' : 'cards'}</span>
                      {selectedCategories.includes(category) && (
                        <span className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiX size={16} className="hover:text-red-700" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No categories found
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Clear All Button */}
        {selectedCategories.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSelectedCategories([]);
                setSearchQuery('');
                setFilteredFlashcards(allFlashcards);
              }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Flashcards Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategories.length > 0 
              ? `Flashcards in ${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'}` 
              : 'All Flashcards'}
            <span className="text-gray-600 text-lg ml-2">
              ({displayFlashcards.length})
            </span>
          </h2>
          
          {selectedCategories.length > 0 && (
            <button 
              onClick={() => navigate(`/deck/${deckId}/study`)}
              className="btn btn-primary"
              disabled={filteredFlashcards.length === 0}
            >
              Study Selected Categories
            </button>
          )}
        </div>

        {displayFlashcards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">
              {selectedCategories.length > 0 
                ? `No flashcards found in ${selectedCategories.length === 1 ? 'this category' : 'these categories'}.`
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