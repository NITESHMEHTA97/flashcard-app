import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardAPI } from '../services/api';

export default function EditCardPage() {
  const { deckId, cardId } = useParams();
  const [flashcard, setFlashcard] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFlashcard();
  }, [cardId]);

  const loadFlashcard = async () => {
    try {
      setLoading(true);
      setError('');
      
      // We need to get the specific flashcard
      // Since we don't have a direct endpoint, we'll get all and filter
      const response = await flashcardAPI.getByDeck(deckId);
      const card = response.data.find(c => c._id === cardId);
      
      if (!card) {
        setError('Flashcard not found');
        return;
      }
      
      setFlashcard(card);
      setQuestion(card.question);
      setAnswer(card.answer);
      setCategory(card.category || '');
      setHint(card.hint || '');
      
    } catch (error) {
      console.error('Failed to load flashcard:', error);
      setError('Failed to load flashcard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      setError('Please enter both question and answer');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await flashcardAPI.update(cardId, {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        hint: hint.trim()
      });
      
      alert('Flashcard updated successfully!');
      navigate(`/deck/${deckId}`);
      
    } catch (error) {
      console.error('Failed to update flashcard:', error);
      setError('Failed to update flashcard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading flashcard...</span>
      </div>
    );
  }

  if (error && !flashcard) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <div className="flex justify-center gap-4">
          <button 
            onClick={loadFlashcard}
            className="btn btn-primary"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate(`/deck/${deckId}`)}
            className="btn btn-outline"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Flashcard</h1>
          <p className="text-gray-600 mt-2">
            Editing card in deck
          </p>
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Flashcard'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate(`/deck/${deckId}`)}
              className="btn btn-outline"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}