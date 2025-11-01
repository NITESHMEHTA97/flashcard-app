import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/common/Layout';

// Import pages
import DeckListPage from './pages/DeckListPage';
import DeckDetailPage from './pages/DeckDetailPage';
import CreateDeckPage from './pages/CreateDeckPage';
import CreateCardPage from './pages/CreateCardPage';
import StudyPage from './pages/StudyPage';
import CategoryFilterPage from './pages/CategoryFilterPage';
import EditCardPage from './pages/EditCardPage';


function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DeckListPage />} />
            <Route path="/deck/:deckId" element={<DeckDetailPage />} />
            <Route path="/create-deck" element={<CreateDeckPage />} />
            <Route path="/deck/:deckId/create-card" element={<CreateCardPage />} />
            <Route path="/deck/:deckId/study" element={<StudyPage />} />
            <Route path="/deck/:deckId/categories" element={<CategoryFilterPage />} />
            <Route path="/deck/:deckId/edit-card/:cardId" element={<EditCardPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;