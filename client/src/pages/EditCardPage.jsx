import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardAPI } from '../services/api';
import FlashcardImage from '../components/FlashcardImage';

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageToRemove, setImageToRemove] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load flashcard data when component mounts or cardId changes
  useEffect(() => {
    loadFlashcard();
  }, [cardId]);

  // Cleanup preview URL when component unmounts or when image changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const loadFlashcard = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get the specific flashcard by ID
      const response = await flashcardAPI.getById(cardId);
      const card = response.data;
      
      if (!card) {
        setError('Flashcard not found');
        return;
      }
      
      setFlashcard(card);
      setQuestion(card.question);
      setAnswer(card.answer);
      setCategory(card.category || '');
      setHint(card.hint || '');
      
      // Reset image states but keep any existing preview
      if (!imagePreview) {
        setImageFile(null);
        setImageToRemove(false);
      }
      
    } catch (error) {
      console.error('Failed to load flashcard:', error);
      setError('Failed to load flashcard. Please try again.');
    } finally {
      setLoading(false);
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
    setImageToRemove(false);
    
    // Create preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageToRemove(true);
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
      // First update the flashcard data
      await flashcardAPI.update(cardId, {
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        hint: hint.trim()
      });
      
      // Handle image upload if a new image was selected
      if (imageFile) {
        await flashcardAPI.uploadImage(cardId, imageFile);
      } 
      // Handle image removal if remove was clicked
      else if (imageToRemove && flashcard.image) {
        await flashcardAPI.removeImage(cardId);
      }
      
      alert('Flashcard updated successfully!');
      navigate(`/deck/${deckId}`);
      
    } catch (error) {
      console.error('Failed to update flashcard:', error);
      setError(error.response?.data?.message || 'Failed to update flashcard. Please try again.');
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
      
      <div className="card">
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
            
            {/* Image Upload Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Flashcard Image</h3>
              
              {/* Current Image or Placeholder */}
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {imagePreview || (flashcard?.image && !imageToRemove) ? (
                      <FlashcardImage 
                        flashcard={{
                          ...flashcard,
                          // Only include the image property if it's not a preview
                          ...(imagePreview ? {} : { image: flashcard.image }),
                          // Include the preview URL if available
                          ...(imagePreview ? { previewUrl: imagePreview } : {})
                        }}
                        size="sm"
                        showControls={false}
                      />
                    ) : (
                      <div className="w-16 h-12 flex items-center justify-center border-2 border-dashed rounded-md text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {imagePreview || (flashcard?.image && !imageToRemove) 
                      ? 'Click the view button to see full size' 
                      : 'Add an image to this flashcard'}
                  </span>
                </div>
              </div>
              
              {/* Image Controls */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  disabled={saving}
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  {imagePreview || (flashcard?.image && !imageToRemove) ? 'Change' : 'Add Image'}
                </label>
                
                {(imagePreview || (flashcard?.image && !imageToRemove)) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    disabled={saving}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                {imagePreview 
                  ? 'New image will be saved when you click Update Flashcard'
                  : flashcard?.image && !imageToRemove 
                    ? 'Click Update Flashcard to apply changes' 
                    : 'JPG, PNG up to 5MB'}
              </p>
            </div>

            {/* Action Buttons */}
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