import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiX } from "react-icons/fi";
import CustomVideoPlayer from "./components/CustomVideoPlayer";

const fetchComments = async (videoId) => {
  try {
    const response = await fetch(`https://api.vickz.ru/get-comments/${videoId}`);

    if (!response.ok) {
      console.error('Ошибка загрузки комментариев:', response.statusText);
      return [];
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Ошибка при загрузке комментариев:', error);
    return [];
  }
};

const likeComment = async (commentId, like) => {
  const access_token = localStorage.getItem('access_token');

  if (!access_token) {
    console.error('Токен не найден');
    window.location.href = '/#/login'
    return;
  }

  try {
    const response = await fetch(`https://api.vickz.ru/like-comment/${commentId}?like=${like}`, {
      method: 'POST',
      headers: { 
        // 'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
    });

    if (!response.ok) {
      console.error('Ошибка при отправке лайка/дизлайка:', response.statusText);
      console.log(response)
    }
  } catch (error) {
    console.error('Ошибка при отправке лайка/дизлайка:', error);
  }
};

const fetchNextVideo = async (index) => {
  const access_token = localStorage.getItem('access_token');

  if (!access_token) {
    localStorage.clear();
    window.location.href = '/';
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

  const toggleComments = async () => {
    if (!showComments && videos[currentIndex]) {
      const loadedComments = await fetchComments(videos[currentIndex].id);
      setComments(loadedComments.map(comment => ({
        ...comment,
        liked: false,
        disliked: false
      })));
    }
    setShowComments((prev) => !prev);
  };

  const handleLike = async (commentId) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const isLiked = !comment.liked;
          if (isLiked && comment.disliked) {
            comment.dislikes -= 1;
            comment.disliked = false;
          }
          likeComment(commentId, true);
          return {
            ...comment,
            liked: isLiked,
            likes: isLiked ? comment.likes + 1 : comment.likes - 1
          };
        }
        return comment;
      })
    );
  };

  const handleDislike = async (commentId) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const isDisliked = !comment.disliked;
          if (isDisliked && comment.liked) {
            comment.likes -= 1;
            comment.liked = false;
          }
          likeComment(commentId, false);
          return {
            ...comment,
            disliked: isDisliked,
            dislikes: isDisliked ? comment.dislikes + 1 : comment.dislikes - 1
          };
        }
        return comment;
      })
    );
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

  const isPortrait = window.matchMedia('(orientation: portrait)').matches;

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

        <div className={`comment-section ${showComments ? 'open' : ''}`}>
          <div className="comments-header">
            <h3>{comments.length} Comments</h3>
            <button className="close-comments-btn" onClick={toggleComments}><FiX size={25} /></button>
          </div>
          <div className="comments-content">
            {comments.length > 0 ? (
              comments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <img
                    src={`https://api.vickz.ru/get-profile-picture/${comment.user_id}`}
                    alt={comment.user_id}
                    className="comment-avatar"
                  />
                  <div className="comment-body">
                    <div className="comment-header">
                      <strong>{comment.user_id}</strong>
                      <div className="comment-actions">
                        <button
                          className={`like-btn ${comment.liked ? 'active' : ''}`}
                          onClick={() => handleLike(comment.id)}
                        >
                          <FiThumbsUp /> {comment.likes}
                        </button>
                        <button
                          className={`dislike-btn ${comment.disliked ? 'active' : ''}`}
                          onClick={() => handleDislike(comment.id)}
                        >
                          <FiThumbsDown /> {comment.dislikes}
                        </button>
                      </div>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>Комментариев пока нет.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
