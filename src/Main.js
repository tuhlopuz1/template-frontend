import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import CustomVideoPlayer from "./components/CustomVideoPlayer";
import apiRequest from './components/Requests';
import CommentsSection from './components/Comments';

const fetchNextVideo = async () => {
  try {
    const response = await apiRequest({
      url: 'https://api.vickz.ru/get-video',
      auth: true
    });

    if (!response.ok) {
      console.log(response);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Произошла ошибка:', error);
    return null;
  }
};

function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadingQueue = useRef([]);
  const loadingInProgress = useRef(false);
  const loadedIndexes = useRef(new Set());

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

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

    const nextVideo = await fetchNextVideo();

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

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;

  useEffect(() => {
    if (!isPortrait && showComments) {
      setShowComments(false);
    }
  }, [currentIndex, isPortrait]);

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
                <div className="loading-placeholder">
                  <div className="loader" />
                </div>
              )}
            </div>
          ))}
        </div>

        {videos[currentIndex] && (
          <CommentsSection
            videoId={videos[currentIndex].id}
            showComments={showComments}
            toggleComments={toggleComments}
          />
        )}
      </div>
    </div>
  );
}

export default MainPage;
