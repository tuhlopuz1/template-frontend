import React, { useState } from 'react';
import './styles/search.css'
import Sidebar from './components/Sidebar.js'

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' или 'users'
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Функция-заглушка
  const mockSearch = (query, type) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'videos') {
          resolve([
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+1' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+2' },
            { thumbnail: 'https://via.placeholder.com/300x533?text=Video+3' },
          ]);
        } else {
          resolve([
            { username: 'user1', avatar: 'https://via.placeholder.com/80?text=U1' },
            { username: 'user2', avatar: 'https://via.placeholder.com/80?text=U2' },
            { username: 'user3', avatar: 'https://via.placeholder.com/80?text=U3' },
          ]);
        }
      }, 500); // 0.5 сек задержка
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
    <div className="p-4 max-w-4xl mx-auto">
     <Sidebar />
      {/* Строка поиска */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Введите запрос..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Поиск
        </button>
      </div>

      {/* Вкладки */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 ${activeTab === 'videos' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
        >
          Видео
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
        >
          Люди
        </button>
      </div>

      {/* Loader */}
      {isLoading && <div className="text-center py-4">Загрузка...</div>}

      {/* Результаты поиска */}
      {!isLoading && (
        <>
          {activeTab === 'videos' && (
            <div className="grid grid-cols-3 gap-4">
              {results.map((video, index) => (
                <div key={index} className="relative w-full" style={{ paddingTop: '177.77%' }}>
                  <img
                    src={video.thumbnail}
                    alt={`Video ${index}`}
                    className="absolute top-0 left-0 w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="flex flex-col gap-4">
              {results.map((user, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                  <span className="font-medium">{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
