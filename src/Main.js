import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiX, FiShare2 } from "react-icons/fi";

// Фейковая функция, имитирующая подгрузку с сервера с данными
const fetchNextVideo = async (index) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const videosData = [
    {
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/public/videos/string/f7d70535-c36e-49bc-9639-6ba241d88352.mp4",
      description: "Это первое видео. Оно очень интересное!",
      author: "user_one",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      likes: 123,
      dislikes: 10,
      comments: 251,
      shares: 15,
      isSubscribed: false,
      userReaction: null // "like" | "dislike" | null
    },
    {
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/public/videos/string/1d00e5fb-3cb0-4e41-93a6-103899ef723a.mp4",
      description: "Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!",
      author: "user_two",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      likes: 456,
      dislikes: 25,
      comments: 89,
      shares: 30,
      isSubscribed: true,
      userReaction: "like"
    },
    {
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/public/videos/string/1acebe6c-4c4e-42c2-b40c-174b4abd578a.mp4",
      description: "Третье видео про путешествия.",
      author: "user_three",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      likes: 789,
      dislikes: 5,
      comments: 150,
      shares: 45,
      isSubscribed: false,
      userReaction: null
    }
    // Добавляй сколько хочешь
  ];

  return videosData[index % videosData.length];
};


function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]);
  const observer = useRef(null);

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const nextIndexRef = useRef(0);
  const isLoadingRef = useRef(false);

  const loadNextVideo = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;

    setVideos((prev) => [...prev, null]);
    const index = nextIndexRef.current;
    const nextVideo = await fetchNextVideo(index);

    setVideos((prev) => {
      const updated = [...prev];
      updated[index] = nextVideo;
      return updated;
    });

    nextIndexRef.current += 1;
    isLoadingRef.current = false;

    // Закрытие комментариев на десктопе (ландшафт)
    // if (window.matchMedia('(orientation: landscape)').matches && showComments) {
    //   setShowComments(false);
    // }
  }, []);

  useEffect(() => {
    loadNextVideo();
  }, [loadNextVideo]);

  const lastVideoRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadNextVideo();
          }
        },
        { threshold: 0.7 }
      );
      if (node) observer.current.observe(node);
    },
    [loadNextVideo]
  );

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;

  const actionBtnSize = 30;

  return (
    <div className="main-layout">
      <Sidebar />

      <div className={`content-area ${showComments ? 'with-comments' : ''}`}>
        {/* Мобильный оверлей для закрытия */}
        {showComments && isPortrait && (
          <div className="mobile-overlay" onClick={toggleComments}></div>
        )}

        <div className={`video-scroll-container no-scrollbar ${showComments && isPortrait ? 'lock-scroll' : ''}`}>
          {videos.map((video, index) => {
            const isLast = index === videos.length - 1;

            return (
              <div
                className="video-wrapper"
                key={index}
                ref={isLast ? lastVideoRef : null}
              >
                <div className="video-container">
                  {video ? (
                    <video
                      className="main-video"
                      src={video.url}
                      controls
                      playsInline
                    />
                  ) : (
                    <div className="loading-placeholder">
                      <div className="loader" />
                    </div>
                  )}
                </div>

                {video && (
                  <>
                    <div className="action-buttons">
                      <button className="action-btn like"><FiThumbsUp size={actionBtnSize} /></button>
                      <p className="stat-amount">{video.likes}</p>
                      <button className="action-btn dislike"><FiThumbsDown size={actionBtnSize} /></button>
                      <p className="stat-amount">{video.dislikes}</p>
                      <button className="action-btn comment-toggle" onClick={toggleComments}><FiMessageCircle size={actionBtnSize} /></button>
                      <p className="stat-amount">{video.comments}</p>
                      <button className="action-btn share"><FiShare2 size={actionBtnSize} /></button>
                      <p className="stat-amount">{video.shares}</p>
                    </div>

                    {/* Нижняя панель с информацией о видео */} 
                      <div className="video-info-bar">
                        <div className="video-info-header">
                          <img src={video.avatar} alt={video.author} className="author-avatar" />
                          <p className="author-nickname">@{video.author}</p>
                          <button
                            className={`subscribe-btn ${video.isSubscribed ? 'subscribed' : ''}`}
                          >
                            {video.isSubscribed ? "Отписаться" : "Подписаться"}
                          </button>
                        </div>
                        <p className="video-description">{video.description}</p>
                      </div>
                  </>
                )}
              </div>
            );
          })}

        </div>

        <div className={`comment-section ${showComments ? 'open' : ''}`}>
          <div className="comments-header">
            <h3>251 Comments</h3>
            <button className="close-comments-btn" onClick={toggleComments}><FiX size={25} /></button>
          </div>
          <div className="comments-content">
            {[...Array(251)].map((_, i) => (
              <p key={i}>Comment {i + 1}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
