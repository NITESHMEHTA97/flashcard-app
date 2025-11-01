import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { flashcardAPI, deckAPI } from '../services/api';

export default function CreateCardPage() {
  const { deckId } = useParams();
  const { state } = useApp();
  const [deck, setDeck] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDeck();
  }, [deckId]);

  const loadDeck = async () => {
    try {
      const response = await deckAPI.getById(deckId);
      setDeck(response.data);
    } catch (error) {
      console.error('Failed to load deck:', error);
      setError('Failed to load deck information.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      setError('Please enter both question and answer');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await flashcardAPI.create({
        deck_id: deckId,
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        hint: hint.trim()
      });
      
      alert('Flashcard created successfully!');
      
      // Reset form and go back to deck
      setQuestion('');
      setAnswer('');
      setCategory('');
      setHint('');
      
      // Navigate back to deck
      navigate(`/deck/${deckId}`);
      
    } catch (error) {
      console.error('Failed to create flashcard:', error);
      setError('Failed to create flashcard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!deck && !error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Add Flashcard</h1>
          {deck && (
            <p className="text-gray-600 mt-2">
              Adding to: <span className="font-semibold">{deck.name}</span>
            </p>
          )}
        </div>
        <button 
          onClick={() => navigate(`/deck/${deckId}`)}
          className="btn btn-outline"
        >
          ← Back to Deck
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Question *
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="form-input form-textarea"
              placeholder="Enter the question"
              rows="3"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Answer *
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-input form-textarea"
              placeholder="Enter the answer"
              rows="3"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Category (Optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              placeholder="e.g., Basics, Advanced, etc."
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">
              Hint (Optional)
            </label>
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="form-input form-textarea"
              placeholder="Enter a helpful hint"
              rows="2"
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Flashcard'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate(`/deck/${deckId}`)}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}