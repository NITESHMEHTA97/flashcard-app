import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { flashcardAPI, deckAPI } from '../services/api';
import FlashcardImage from '../components/FlashcardImage';

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    setImageFile(file);
    
    // Create preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      // First create the flashcard
      const response = await flashcardAPI.create({
        deck_id: deckId,
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        hint: hint.trim()
      });
      
      alert('Flashcard created successfully!');
      
      // Handle image upload if an image was selected
      if (imageFile) {
        await flashcardAPI.uploadImage(response.data._id, imageFile);
      }
      
      // Clean up the preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // Reset form and go back to deck
      setQuestion('');
      setAnswer('');
      setCategory('');
      setHint('');
      
      // Redirect to deck page after successful creation
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
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Flashcard Image</h3>
            {imagePreview ? (
              <div className="mb-4">
                <div className="relative">
 <FlashcardImage 
                    flashcard={{ previewUrl: imagePreview }}
                    size="lg"
                    showControls={false}
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={loading}
                  >
                    Change
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-3">No image selected</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                  disabled={loading}
                >
                  Add Image
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
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