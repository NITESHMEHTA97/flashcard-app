import axios from 'axios';

// In development, use proxy; in production, use same origin
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Enhanced API with error handling
export const deckAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/decks');
      return response;
    } catch (error) {
      console.error('Error fetching decks:', error);
      throw error;
    }
  },
  
  create: async (deckData) => {
    try {
      const response = await api.post('/decks', deckData);
      return response;
    } catch (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`/decks/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching deck:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/decks/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }
  },
  
  exportDeck: async (deckId) => {
    try {
      // Remove responseType: 'blob' since we're expecting JSON
      const response = await api.get(`/decks/${deckId}/export`);
      return response;
    } catch (error) {
      console.error('Error exporting deck:', error);
      throw error;
    }
  },
  
  importDeck: async (importData) => {
    try {
      const response = await api.post('/decks/import', importData);
      return response;
    } catch (error) {
      console.error('Error importing deck:', error);
      throw error;
    }
  }
};

export const flashcardAPI = {
  getById: async (id) => {
    try {
      const response = await api.get(`/flashcards/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      throw error;
    }
  },
  
  getByDeck: async (deckId, config = {}) => {
    try {
      const response = await api.get(`/decks/${deckId}/flashcards`, config);
      return response;
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      throw error;
    }
  },
  
  create: async (cardData) => {
    try {
      const response = await api.post('/flashcards', cardData);
      return response;
    } catch (error) {
      console.error('Error creating flashcard:', error);
      throw error;
    }
  },
  
  getCategories: async (deckId) => {
    try {
      const response = await api.get(`/decks/${deckId}/categories`);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  getByCategory: async (deckId, category) => {
    try {
      const response = await api.get(`/decks/${deckId}/flashcards/category/${category}`);
      return response;
    } catch (error) {
      console.error('Error fetching flashcards by category:', error);
      throw error;
    }
  },
  
  update: async (id, cardData) => {
    try {
      const response = await api.put(`/flashcards/${id}`, cardData);
      return response;
    } catch (error) {
      console.error('Error updating flashcard:', error);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`/flashcards/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      throw error;
    }
  },

  uploadImage: async (flashcardId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/flashcards/${flashcardId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },
  
  removeImage: async (flashcardId) => {
    const response = await api.delete(`/flashcards/${flashcardId}/image`);
    return response;
  },
  
  getImageUrl: (flashcard) => {
    return flashcard.image ? `/api/uploads/${flashcard.image}` : null;
  }
};

export default api;