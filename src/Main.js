import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiX, FiShare2, FiHeart } from "react-icons/fi";
import CustomVideoPlayer from "./components/CustomVideoPlayer";

// Фейковая функция для подгрузки
const fetchNextVideo = async (index) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const videosData = [
    {
      url: "http://176.113.83.132:8000/stream-video/068612be-cadd-7dd1-ac12-a5a2274e12ed",
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
      url: "http://176.113.83.132:8000/stream-video/068612be-cadd-7dd1-ac12-a5a2274e12ed",
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
      url: "http://176.113.83.132:8000/stream-video/068612be-cadd-7dd1-ac12-a5a2274e12ed",
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
      url: "http://176.113.83.132:8000/stream-video/068612be-cadd-7dd1-ac12-a5a2274e12ed",
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
  ];

  return videosData[index % videosData.length];
};

function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]);
  const [comments, setComments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Очередь индексов для загрузки и состояние загрузки
  const loadingQueue = useRef([]);
  const loadingInProgress = useRef(false);

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
    },
    {
      author: "user_commenter2",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      content: "Спасибо за полезный контент.",
      likes: 7
    },
    {
      author: "user_commenter2",
      avatar: "https://randomuser.me/api/portraits/women/6.jpg",
      content: "Спасибо за полезный контент.",
      likes: 7
    },
  ];

  // Загружаем видео по индексу (один за раз)
  const loadVideoAtIndex = useCallback(async (index) => {
    if (loadingInProgress.current) return;
    loadingInProgress.current = true;

    // Обеспечиваем, что массив videos достаточно длинный
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

    loadingInProgress.current = false;

    // После загрузки текущего — стартуем следующую загрузку из очереди
    if (loadingQueue.current.length > 0) {
      const nextIndex = loadingQueue.current.shift();
      loadVideoAtIndex(nextIndex);
    }
  }, []);

  // Добавляем индекс в очередь загрузки, если не загружен и не в очереди
  const enqueueLoad = useCallback((index) => {
    if (videos[index] || loadingQueue.current.includes(index)) return;
    loadingQueue.current.push(index);

    if (!loadingInProgress.current) {
      const nextIndex = loadingQueue.current.shift();
      loadVideoAtIndex(nextIndex);
    }
  }, [videos, loadVideoAtIndex]);

  // Следим за текущим индексом и планируем загрузку следующих 3 видео
  useEffect(() => {
    const preloadCount = 3;
    for (let i = currentIndex + 1; i <= currentIndex + preloadCount; i++) {
      enqueueLoad(i);
    }
  }, [currentIndex, enqueueLoad]);

  // Инициализируем загрузку первого видео при монтировании
  useEffect(() => {
    enqueueLoad(0);
  }, [enqueueLoad]);

  // IntersectionObserver для смены активного видео
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
                  <div className="action-buttons">
                    <button className="action-btn like"><FiThumbsUp size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                    <button className="action-btn dislike"><FiThumbsDown size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                    <button className="action-btn comment-toggle" onClick={toggleComments}><FiMessageCircle size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
                    <button className="action-btn share"><FiShare2 size={actionBtnSize} /></button>
                    <p className="stat-amount">0</p>
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
