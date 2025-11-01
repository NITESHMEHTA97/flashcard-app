import React, { useState } from 'react';
import { deckAPI } from '../services/api';

export default function ExportDeckModal({ deck, isOpen, onClose }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Create a hidden iframe for the download
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Set up a message handler for the download complete event
      const handleMessage = (event) => {
        if (event.data === 'downloadComplete') {
          // Clean up
          document.body.removeChild(iframe);
          window.removeEventListener('message', handleMessage);
          
          // Show success message and close modal
          alert('Deck exported successfully!');
          onClose();
        }
      };
      
      // Listen for download complete message
      window.addEventListener('message', handleMessage);
      
      // Create a form to submit the request
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/decks/${deck._id}/export`;
      form.target = 'download-iframe';
      
      // Create a hidden iframe to handle the download
      const downloadIframe = document.createElement('iframe');
      downloadIframe.name = 'download-iframe';
      downloadIframe.style.display = 'none';
      document.body.appendChild(downloadIframe);
      
      // Add the form to the document and submit it
      document.body.appendChild(form);
      form.submit();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(downloadIframe);
        window.removeEventListener('message', handleMessage);
      }, 10000);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export deck. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Export Deck</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Export <strong>"{deck.name}"</strong> with all its flashcards to a JSON file.
          </p>
          <p className="text-sm text-gray-500">
            This file can be imported later or shared with others.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={exporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export Deck'}
          </button>
        </div>
      </div>
    </div>
  );
}