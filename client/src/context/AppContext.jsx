import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  decks: [],
  currentDeck: null,
  flashcards: [],
  loading: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DECKS':
      return { ...state, decks: action.payload };
    case 'SET_CURRENT_DECK':
      return { ...state, currentDeck: action.payload };
    case 'SET_FLASHCARDS':
      return { ...state, flashcards: action.payload };
    case 'ADD_DECK':
      return { ...state, decks: [...state.decks, action.payload] };
    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case 'DELETE_DECK':
      return { 
        ...state, 
        decks: state.decks.filter(deck => deck._id !== action.payload) 
      };
    case 'DELETE_FLASHCARD':
      return { 
        ...state, 
        flashcards: state.flashcards.filter(card => card._id !== action.payload) 
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}