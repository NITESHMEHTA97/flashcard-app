import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <header style={{
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>🃏 Flashcard Master</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>Your personal flashcard learning app</p>
      </header>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#1e293b', margin: 0 }}>My Decks</h2>
          <button style={{
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            + Create Deck
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Sample deck cards */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>React Native</h3>
            <p style={{ color: '#64748b', margin: '0 0 15px 0' }}>React Native concepts and components</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <span>5 cards</span>
              <span style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px'
              }}>View Deck →</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>JavaScript</h3>
            <p style={{ color: '#64748b', margin: '0 0 15px 0' }}>JavaScript fundamentals and advanced concepts</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <span>8 cards</span>
              <span style={{
                backgroundColor: '#6366f1',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px'
              }}>View Deck →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;