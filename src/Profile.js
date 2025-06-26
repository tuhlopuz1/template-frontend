import Sidebar from "./components/Sidebar";
import { useState } from "react";
import './styles/profile.css';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('videos');

  const user = {
    username: "user_one",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    description: "Путешественник, создающий видео о самых красивых местах мира.",
    followers: 1200,
    following: 180,
    likes: 3500
  };

  const userVideos = [
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+1", description: "Моё первое видео" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+2", description: "Путешествие в горы" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+2", description: "Путешествие в горы" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+2", description: "Путешествие в горы" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+2", description: "Путешествие в горы" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+2", description: "Путешествие в горы" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Video+3", description: "Удивительный закат" }
  ];

  const likedVideos = [
    { thumbnail: "https://via.placeholder.com/300x500?text=Liked+1", description: "Интересное видео" },
    { thumbnail: "https://via.placeholder.com/300x500?text=Liked+2", description: "Классный ролик" }
  ];

  const videosToDisplay = activeTab === 'videos' ? userVideos : likedVideos;

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <img src={user.avatar} alt={user.username} className="profile-avatar" />
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p>{user.description}</p>
            <div className="profile-stats">
              <div><strong>{user.followers}</strong> Подписчики</div>
              <div><strong>{user.following}</strong> Подписки</div>
              <div><strong>{user.likes}</strong> Лайки</div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Видео
          </button>
          <button
            className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            Понравившиеся
          </button>
        </div>

        <div className="videos-grid">
          {videosToDisplay.map((video, index) => (
                <div className="video-thumbnail-wrapper" key={index}>
                    <img src={video.thumbnail} alt={`Video ${index}`} />
                </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
