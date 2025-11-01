import React, { useState } from 'react';
import { deckAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export default function ImportDeckModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const { dispatch } = useApp();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
    
    // Validate file type
    if (selectedFile && !selectedFile.name.endsWith('.json')) {
      setError('Please select a JSON file');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setImporting(true);
      setError('');
      
      const fileContent = await readFileContent(file);
      const importData = JSON.parse(fileContent);
      
      if (!importData.deck || !importData.flashcards) {
        throw new Error('Invalid deck file format');
      }
      
      const response = await deckAPI.importDeck({
        deckData: importData.deck,
        flashcardsData: importData.flashcards
      });
      
      const newDeck = response.data;
      dispatch({ type: 'ADD_DECK', payload: newDeck });
      
      alert(`Deck "${newDeck.name}" imported successfully with ${newDeck.card_count} cards!`);
      setFile(null);
      onClose();
      
      if (onImport) {
        onImport(newDeck);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setError('Failed to import deck. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Import Deck</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Import a deck from a previously exported JSON file.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              {file ? (
                <div className="text-green-600">
                  <div className="text-2xl mb-2">✓</div>
                  <div className="font-medium">{file.name}</div>
                </div>
              ) : (
                <div className="text-gray-500">
                  <div className="text-2xl mb-2">📁</div>
                  <div className="font-medium">Click to select JSON file</div>
                  <div className="text-sm mt-1">or drag and drop</div>
                </div>
              )}
            </label>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="btn btn-primary"
            disabled={!file || importing}
          >
            {importing ? 'Importing...' : 'Import Deck'}
          </button>
        </div>
      </div>
    </div>
  );
}