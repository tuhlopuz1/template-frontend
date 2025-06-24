import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiX, FiShare2 } from "react-icons/fi";
import CustomVideoPlayer from "./components/CustomVideoPlayer";

// Фейковая функция для подгрузки
const fetchNextVideo = async (index) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const videosData = [
    {
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/videos/string/e3348fb7-84db-4d57-8eb2-3275e6103056.mp4",
      description: "Это первое видео. Оно очень интересное!",
      author: "user_one",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      likes: 123,
      dislikes: 10,
      comments: 251,
      shares: 15,
      isSubscribed: false,
      userReaction: null
    },
    {
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/videos/string/e0545842-1a1e-49b2-adbd-375eb1c4c18e.mp4",
      description: "Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!Второе видео, наслаждайтесь просмотром!  ",
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
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/videos/string/e0545842-1a1e-49b2-adbd-375eb1c4c18e.mp4",
      description: "Третье видео про путешествия.",
      author: "user_three",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      likes: 789,
      dislikes: 5,
      comments: 150,
      shares: 45,
      isSubscribed: false,
      userReaction: null
    },
    {
      url: "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/videos/string/e0545842-1a1e-49b2-adbd-375eb1c4c18e.mp4",
      description: "Четвёртое видео про путешествия.",
      author: "user_three",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      likes: 789,
      dislikes: 5,
      comments: 150,
      shares: 45,
      isSubscribed: true,
      userReaction: null
    },
    // Добавляй сколько хочешь
  ];

  return videosData[index % videosData.length];
};

function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]); // Храним загруженные видео
  const [currentIndex, setCurrentIndex] = useState(0); // Текущий индекс активного видео
  const nextIndexRef = useRef(0);
  const isLoadingRef = useRef(false);
  const observers = useRef([]);

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const loadVideoAtIndex = useCallback(async (index) => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setVideos((prev) => {
      const updated = [...prev];
      while (updated.length <= index) {
        updated.push(null); // Создаём placeholder если вдруг массив короче
      }
      return updated;
    });

    const nextVideo = await fetchNextVideo(index);

    setVideos((prev) => {
      const updated = [...prev];
      updated[index] = nextVideo;
      return updated;
    });

    nextIndexRef.current = Math.max(nextIndexRef.current, index + 1);
    isLoadingRef.current = false;
  }, []);

  const ensurePreloaded = useCallback(async (index) => {
    const preloadCount = 3;
    for (let i = index + 1; i <= index + preloadCount; i++) {
      if (!videos[i]) {
        await loadVideoAtIndex(i);
      }
    }
  }, [videos, loadVideoAtIndex]);

  // Инициализируем первые видео
  useEffect(() => {
    loadVideoAtIndex(0);
  }, [loadVideoAtIndex]);

  // Создаем IntersectionObserver для каждого видео
  const videoRefs = useRef([]);

  useEffect(() => {
    observers.current.forEach((observer) => observer.disconnect());
    observers.current = [];

    videoRefs.current.forEach((node, index) => {
      if (node) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              setCurrentIndex(index);
            }
          },
          { threshold: 0.7 }
        );
        observer.observe(node);
        observers.current.push(observer);
      }
    });

    return () => {
      observers.current.forEach((observer) => observer.disconnect());
    };
  }, [videos]);

  // Следим за сменой активного видео и подгружаем вперед
  useEffect(() => {
    ensurePreloaded(currentIndex);
  }, [currentIndex, ensurePreloaded]);

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const actionBtnSize = 30;

  return (
    <div className="main-layout">
      <Sidebar />
      <div className={`content-area ${showComments ? 'with-comments' : ''}`}>
        {showComments && isPortrait && (
          <div className="mobile-overlay" onClick={toggleComments}></div>
        )}

        <div className={`video-scroll-container no-scrollbar ${showComments && isPortrait ? 'lock-scroll' : ''}`}>
          {videos.map((video, index) => (
            <div
              className="video-wrapper"
              key={index}
              ref={(el) => (videoRefs.current[index] = el)}
            >
              {video ? (
                <CustomVideoPlayer video={video} toggleComments={toggleComments} />
              ) : (
                <>
                  <div className="loading-placeholder">
                    <div className="loader" />
                  </div>
                  <div className="action-buttons">
                    <button className="action-btn like"><FiThumbsUp size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                    <button className="action-btn dislike"><FiThumbsDown size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                    <button className="action-btn comment-toggle" onClick={toggleComments}><FiMessageCircle size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                    <button className="action-btn share" ><FiShare2 size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                  </div>
                </>
              )}
            </div>
          ))}
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
