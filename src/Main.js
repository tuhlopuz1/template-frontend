import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiX, FiShare2, FiHeart } from "react-icons/fi";
import CustomVideoPlayer from "./components/CustomVideoPlayer";

// Фейковая функция для подгрузки
const fetchNextVideo = async (index) => {
  const access_token = localStorage.getItem('access_token');

  if (!access_token) {
    localStorage.clear();
    window.location.href = '/#/login';
    return null;
  }

  try {
    const response = await fetch('https://api.vickz.ru/get-video', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      console.log(response);
      return null;
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error('Произошла ошибка:', error);
    return null;
  }
};

function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]);
  const [comments, setComments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadingQueue = useRef([]);
  const loadingInProgress = useRef(false);
  const loadedIndexes = useRef(new Set());

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const exampleComments = [
    {
      author: "user_commenter1",
      avatar: "https://randomuser.me/api/portraits/men/5.jpg",
      content: "Очень крутое видео!",
      likes: 12
    },
    {
      author: "user_commenter2",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      content: "Спасибо за полезный контент.",
      likes: 7
    }
  ];

  const loadVideoAtIndex = useCallback(async (index) => {
    if (loadingInProgress.current) return;
    loadingInProgress.current = true;

    setVideos((prev) => {
      const updated = [...prev];
      while (updated.length <= index) {
        updated.push(null);
      }
      return updated;
    });

    const nextVideo = await fetchNextVideo(index);

    setVideos((prev) => {
      const updated = [...prev];
      updated[index] = nextVideo;
      return updated;
    });

    loadedIndexes.current.add(index);
    loadingInProgress.current = false;

    if (loadingQueue.current.length > 0) {
      const nextIndex = loadingQueue.current.shift();
      loadVideoAtIndex(nextIndex);
    }
  }, []);

  const enqueueLoad = useCallback((index) => {
    if (loadedIndexes.current.has(index) || loadingQueue.current.includes(index)) return;

    loadingQueue.current.push(index);

    if (!loadingInProgress.current) {
      const nextIndex = loadingQueue.current.shift();
      loadVideoAtIndex(nextIndex);
    }
  }, [loadVideoAtIndex]);

  useEffect(() => {
    const preloadCount = 3;
    for (let i = currentIndex + 1; i <= currentIndex + preloadCount; i++) {
      enqueueLoad(i);
    }
  }, [currentIndex, enqueueLoad]);

  useEffect(() => {
    enqueueLoad(0);
  }, [enqueueLoad]);

  const observers = useRef([]);
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

  useEffect(() => {
    setComments(exampleComments);
  }, []);

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
                <CustomVideoPlayer
                  video={video}
                  toggleComments={toggleComments}
                  isActive={index === currentIndex}
                />
              ) : (
                <>
                  <div className="loading-placeholder">
                    <div className="loader" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className={`comment-section ${showComments ? 'open' : ''}`}>
          <div className="comments-header">
            <h3>{comments.length} Comments</h3>
            <button className="close-comments-btn" onClick={toggleComments}><FiX size={25} /></button>
          </div>
          <div className="comments-content">
            {comments.length > 0 ? (
              comments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                  <div className="comment-body">
                    <div className="comment-header">
                      <strong>{comment.author}</strong>
                      <div className="comment-likes"><FiHeart /> {comment.likes}</div>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Загрузка комментариев...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
