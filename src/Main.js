import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiX, FiShare2 } from "react-icons/fi";

// Фейковая функция, имитирующая подгрузку с сервера
const fetchNextVideo = async (index) => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // задержка 1.5 сек
  const urls = [
  
    "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/public/videos/string/f7d70535-c36e-49bc-9639-6ba241d88352.mp4",
    "https://uozfhywwucahpeysjtvy.supabase.co/storage/v1/object/public/videos/string/1d00e5fb-3cb0-4e41-93a6-103899ef723a.mp4",
    // Добавь больше ссылок или API
  ];
  return urls[index % urls.length];
};

function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]); // null = лоадер
  const observer = useRef(null);

  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
const nextIndexRef = useRef(0); // отслеживаем индекс отдельно
const isLoadingRef = useRef(false); // предотвращаем дубли

const loadNextVideo = useCallback(async () => {
  if (isLoadingRef.current) return;

  isLoadingRef.current = true;

  // Сначала вставим null (лоадер)
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
}, []);


  
    useEffect(() => {
      loadNextVideo(); // загрузка первого видео
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

  return (
    <div className="main-layout">
      <Sidebar />

      <div className={`content-area ${showComments ? 'with-comments' : ''}`}>
        <div className="video-scroll-container no-scrollbar">
          {videos.map((videoSrc, index) => {
            const isLast = index === videos.length - 1;

            return (
              <div
                className="video-wrapper"
                key={index}
                ref={isLast ? lastVideoRef : null}
              >
                <div className="video-container">
                  {videoSrc ? (
                    <video
                      className="main-video"
                      src={videoSrc}
                      controls
                      playsInline
                    />
                  ) : (
                    <div className="loading-placeholder">
                      <div className="loader" />
                    </div>
                  )}
                </div>

                <div className="action-buttons">
                  <button className="action-btn like"><FiThumbsUp /></button>
                  <button className="action-btn dislike"><FiThumbsDown /></button>
                  <button className="action-btn comment-toggle" onClick={toggleComments}><FiMessageCircle size={22} /></button>
                  <button className="action-btn share"><FiShare2 /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={`comment-section ${showComments ? 'open' : ''}`}>
          <div className="comments-header">
            <h3>Комментарии</h3>
            <button className="close-comments-btn" onClick={toggleComments}><FiX size={20} /></button>
          </div>
          <div className="comments-content">
            <p>Комментарий 1</p>
            <p>Комментарий 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
