import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { deckAPI } from '../services/api';

import ExportDeckModal from '../components/ExportDeckModal';
import ImportDeckModal from '../components/ImportDeckModal';

export default function DeckListPage() {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await deckAPI.getAll();
      dispatch({ type: 'SET_DECKS', payload: response.data });
    } catch (error) {
      console.error('Failed to load decks:', error);
      setError('Failed to load decks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async (deckId, deckName) => {
    if (window.confirm(`Are you sure you want to delete "${deckName}"?`)) {
      try {
        // Delete deck from server
        await deckAPI.delete(deckId);
        
        // Update local state
        dispatch({ type: 'DELETE_DECK', payload: deckId });
        
        // Show success message
        alert('Deck deleted successfully!');
      } catch (error) {
        console.error('Delete deck error:', error);
        alert('Failed to delete deck. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-gray-600">Loading decks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">❌ {error}</div>
        <button 
          onClick={loadDecks}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Decks</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="btn btn-outline"
          >
            📁 Import Deck
          </button>
          <Link 
            to="/create-deck"
            className="btn btn-primary"
          >
            + Create Deck
          </Link>
        </div>
      </div>

      {state.decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🃏</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            No decks yet!
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first deck to start organizing your flashcards.
          </p>
          <Link 
            to="/create-deck"
            className="btn btn-primary text-lg"
          >
            Create Your First Deck
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.decks.map(deck => (
            <div 
              key={deck._id}
              className="card hover:shadow-xl transition-shadow"
            >
              <Link to={`/deck/${deck._id}`} className="block mb-3">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-primary transition-colors">
                  {deck.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {deck.description || 'No description'}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{deck.card_count || 0} cards</span>
                  <span className="bg-primary text-white px-2 py-1 rounded-full text-xs">
                    View Deck →
                  </span>
                </div>
              </Link>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Created: {new Date(deck.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeck(deck);
                      setExportModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    Export
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck._id, deck.name);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Modal */}
      {selectedDeck && (
        <ExportDeckModal
          deck={selectedDeck}
          isOpen={exportModalOpen}
          onClose={() => {
            setExportModalOpen(false);
            setSelectedDeck(null);
          }}
        />
      )}
      
      {/* Import Modal */}
      <ImportDeckModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={(newDeck) => {
          // Deck was imported successfully
          setImportModalOpen(false);
          // Refresh the decks list
          loadDecks();
        }}
      />
    </div>
  );
}