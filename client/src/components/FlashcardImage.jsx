import React, { useState } from 'react';
import { flashcardAPI } from '../services/api';

export default function FlashcardImage({ flashcard, size = 'sm', showControls = false, onImageUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const imageUrl = flashcardAPI.getImageUrl(flashcard);

  const sizeClasses = {
    sm: 'w-12 h-10',   // Small - for lists
    md: 'w-32 h-24',   // Medium - for study mode
    lg: 'w-48 h-36'    // Large - for forms
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      await flashcardAPI.uploadImage(flashcard._id, file);
      onImageUpdate?.();
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Remove this image?')) return;
    
    try {
      await flashcardAPI.removeImage(flashcard._id);
      onImageUpdate?.();
    } catch (error) {
      alert('Failed to remove image');
    }
  };

  // No image state
  if (!imageUrl) {
    if (!showControls) return null;
    
    return (
      <div className="text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          id={`image-upload-${flashcard._id}`}
        />
        <label
          htmlFor={`image-upload-${flashcard._id}`}
          className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
        >
          {uploading ? 'Uploading...' : '+ Add Image'}
        </label>
      </div>
    );
  }

  // Has image - show thumbnail
  return (
    <div className="flex flex-col items-center">
      {/* Thumbnail */}
      <div 
        className={`${sizeClasses[size]} border border-gray-300 rounded cursor-pointer overflow-hidden hover:border-blue-500 transition-colors`}
        onClick={() => setModalOpen(true)}
      >
        <img 
          src={imageUrl}
          alt="Flashcard"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => setModalOpen(true)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            View
          </button>
          <button
            onClick={handleRemoveImage}
            className="text-red-600 hover:text-red-800 text-xs"
          >
            Remove
          </button>
        </div>
      )}

      {/* Full Image Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-10 right-0 text-white text-lg bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            <img 
              src={imageUrl} 
              alt="Full size"
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}