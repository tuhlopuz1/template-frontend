// ProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import './styles/profile.css';

function UserPage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные о пользователе
        const userResponse = await fetch(`https://api.vickz.ru/get-user/${username}`);
        if (!userResponse.ok) {
          throw new Error('Пользователь не найден');
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Получаем видео пользователя
        const videosResponse = await fetch(`https://api.vickz.ru/get-videos-by-user-id/${userData.id}`);
        if (!videosResponse.ok) {
          throw new Error('Ошибка при получении видео');
        }
        const videosData = await videosResponse.json();

        // Формируем массив видео (если нужно, можешь потом дополнить ссылками на превью)
        const videos = videosData.video_ids.map(videoId => ({
          id: videoId,
          // Здесь ты должен подставить реальную логику получения превью (если у тебя есть эндпоинт)
          thumbnail: `https://via.placeholder.com/300x500?text=Video+${videoId}`
        }));

        setUserVideos(videos);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  if (loading) {
    return <div className="main-layout"><Sidebar /><div className="profile-content">Загрузка...</div></div>;
  }

  if (error) {
    return <div className="main-layout"><Sidebar /><div className="profile-content">Ошибка: {error}</div></div>;
  }

  if (!user) {
    return <div className="main-layout"><Sidebar /><div className="profile-content">Пользователь не найден</div></div>;
  }

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <img src={`https://api.vickz.ru/get-profile-picture/${user.id}`} alt={user.username} className="profile-avatar" />
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p>{user.description}</p>
            <div className="profile-stats">
              <div><strong>{user.followers_count}</strong> Followers</div>
              <div><strong>{user.subscriptions_count}</strong> Following</div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button className="tab-btn active">Videos of {user.username}</button>
        </div>

        <div className="videos-grid">
            {userVideos.map((video, index) => (
            <div className="video-thumbnail-wrapper" key={index}>
                <video
                src={`https://api.vickz.ru/stream-video/${video.id}`}
                controls={false}
                muted
                preload="metadata"
                onLoadedMetadata={e => e.target.currentTime = 1} // Показывать первый кадр на 1-й секунде
                onClick={() => { /* Здесь можешь сделать переход на страницу с видео */ }}
                />
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default UserPage;
