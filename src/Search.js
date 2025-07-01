import React, { useState } from 'react';
import './styles/search.css';
import Sidebar from './components/Sidebar.js';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' или 'users'
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const mockSearch = (query, type) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'videos') {
          resolve([
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+1' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+2' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
          ]);
        } else {
          resolve([
            { username: 'user1', avatar: 'https://via.placeholder.com/80?text=U1' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user3', avatar: 'https://via.placeholder.com/80?text=U3' },
          ]);
        }
      }, 500);
    });
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    const data = await mockSearch(query, activeTab);
    setResults(data);
    setIsLoading(false);
  };

  return (
    <div className="search-page">
      <Sidebar />
      <div className="search-container">
        {/* Строка поиска */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {/* Вкладки */}
        <div className="tabs">
          <button
            className={activeTab === 'videos' ? 'active' : ''}
            onClick={() => setActiveTab('videos')}
          >
            Video
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            People
          </button>
        </div>

        {/* Loader */}
        {isLoading && <div className="loader">Loading...</div>}

        {/* Результаты */}
        {!isLoading && (
          <>
            {activeTab === 'videos' && (
              <div className="videos-grid">
                {results.map((video, index) => (
                  <div key={index} className="video-thumbnail">
                    <img src={video.thumbnail} alt={`Video ${index}`} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-list">
                {results.map((user, index) => (
                  <div key={index} className="user-card">
                    <img src={user.avatar} alt={user.username} />
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
