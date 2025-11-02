import React, { useState, useEffect } from 'react';
import { flashcardAPI } from '../services/api';

export default function FlashcardImage({ flashcard, size = 'sm', showControls = false, onImageUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fileInputRef = React.useRef(null);

  // Use previewUrl if provided, otherwise get the URL from the API
  const imageUrl = flashcard.previewUrl || (flashcard.image ? flashcardAPI.getImageUrl(flashcard) : '');

  const sizeClasses = {
    container: {
      xs: 'w-10 h-8 !min-w-[2.5rem]',
      sm: 'w-16 h-12',
      md: 'w-24 h-20',
      lg: 'w-full max-w-xs h-48'
    },
    image: {
      xs: 'w-full h-full object-contain',
      sm: 'w-full h-full object-cover',
      md: 'w-full h-full object-cover',
      lg: 'w-full h-full object-cover'
    }
  };

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);

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
          disabled={uploading}
        />
        <label
          htmlFor={`image-upload-${flashcard._id}`}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
            uploading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
          } transition-colors duration-200`}
        >
          {uploading ? 'Uploading...' : 'Add Image'}
        </label>
      </div>
    );
  }

  // Has image - show thumbnail
  return (
    <div className="flex flex-col items-center">
      {/* Thumbnail */}
      <div 
        className={`relative group ${sizeClasses.container[size]} flex-shrink-0 ${!imageLoaded ? 'animate-pulse' : ''}`}
        onClick={() => setModalOpen(true)}
      >
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={imageUrl}
            alt="Flashcard"
            className={`${sizeClasses.image[size]} max-w-[2.5rem] max-h-[2rem] transition-transform duration-300 group-hover:scale-105`}
            onLoad={() => setImageLoaded(true)}
            style={{
              maxWidth: '40px',
              maxHeight: '32px',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-md" />
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      {/* Full Image Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-100 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflow: 'auto'
          }}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(false);
              }}
              className="fixed top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
              aria-label="Close"
              style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 10000,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '9999px',
                padding: '0.5rem',
                cursor: 'pointer',
                border: 'none',
                outline: 'none'
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt="Full size flashcard"
                className="max-w-[90vw] max-h-[90vh] object-contain"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}