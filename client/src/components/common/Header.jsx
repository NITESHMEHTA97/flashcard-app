import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-white">
            🃏 Flashcard Master
          </Link>
          
          <nav className="flex gap-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/' 
                  ? 'bg-white text-primary font-semibold' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Decks
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}