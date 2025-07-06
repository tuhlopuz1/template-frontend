import Sidebar from "./components/Sidebar";
import { useState, useEffect, useRef, useCallback } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiX, FiArrowUp } from "react-icons/fi";
import CustomVideoPlayer from "./components/CustomVideoPlayer";
import apiRequest from './components/Requests'; // если ты выносишь apiRequest в отдельный файл
import { Link } from 'react-router-dom'

const fetchComments = async (videoId) => {
  try {
    const response = await apiRequest({
      url: `https://api.vickz.ru/get-comments/${videoId}`
    });

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
  try {
    const response = await apiRequest({
      url: `https://api.vickz.ru/like-comment/${commentId}`,
      method: 'POST',
      params: { like },
      auth: true
    });

    if (!response.ok) {
      console.error('Ошибка при отправке лайка/дизлайка:', response.statusText);
      console.log(response);
    }
  } catch (error) {
    console.error('Ошибка при отправке лайка/дизлайка:', error);
  }
};

const fetchNextVideo = async (index) => {
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

const sendComment = async (videoId, commentText) => {
  try {
    const response = await apiRequest({
      url: `https://api.vickz.ru/add-comment/${videoId}`,
      method: 'POST',
      auth: true,
      body: commentText
    });

    if (!response.ok) {
      console.error('Ошибка при отправке комментария:', response.statusText);
      return null;
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Ошибка при отправке комментария:', error);
    return null;
  }
};

function MainPage() {
  const [showComments, setShowComments] = useState(false);
  const [videos, setVideos] = useState([null]);
  const [comments, setComments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newComment, setNewComment] = useState('');

  const loadingQueue = useRef([]);
  const loadingInProgress = useRef(false);
  const loadedIndexes = useRef(new Set());

  const toggleComments = async () => {
    if (!showComments && videos[currentIndex]) {
      const loadedComments = await fetchComments(videos[currentIndex].id);
      console.log(loadedComments)
      setComments(loadedComments.map(comment => ({
        ...comment,
      })));
    }
    setShowComments((prev) => !prev);
  };

  const handleLike = async (commentId) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const isLiked = !comment.is_liked_by_user;
          if (isLiked && comment.is_disliked_by_user) {
            comment.dislikes -= 1;
            comment.is_disliked_by_user = false;
          }
          likeComment(commentId, true);
          return {
            ...comment,
            is_liked_by_user: isLiked,
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
          const isDisliked = !comment.is_disliked_by_user;
          if (isDisliked && comment.is_liked_by_user) {
            comment.likes -= 1;
            comment.is_liked_by_user = false;
          }
          likeComment(commentId, false);
          return {
            ...comment,
            is_disliked_by_user: isDisliked,
            dislikes: isDisliked ? comment.dislikes + 1 : comment.dislikes - 1
          };
        }
        return comment;
      })
    );
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !videos[currentIndex]) return;

    const result = await sendComment(videos[currentIndex].id, newComment.trim());
    if (result) {
      setComments((prev) => [
        ...prev,
        {
          ...result,
          user_id: localStorage.getItem('id'),
          content: newComment.trim(),
          likes: 0,
          dislikes: 0,
          liked: false,
          disliked: false
        }
      ]);
      setNewComment('');
    }
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

        <div className={`comment-section ${showComments ? 'open' : ''}`}>
          <div className="comments-header">
            <h3>{comments.length} Comments</h3>
            <button className="close-comments-btn" onClick={toggleComments}><FiX size={25} /></button>
          </div>

          <div className="comments-content">
            {comments.length > 0 ? (
              comments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <Link to = {`/user/${comment.user_username}`}>
                    <img
                      src={`https://api.vickz.ru/get-profile-picture/${comment.user_id}`}
                      alt={comment.user_id}
                      className="comment-avatar"
                    />
                  </Link>
                  <div className="comment-body">
                    <div className="comment-header">
                        <Link to = {`/user/${comment.user_username}`} className="black-link">
                            <strong>{comment.user_name}</strong>
                        </Link>
                      <div className="comment-actions">
                        <button
                          className={`like-btn ${comment.is_liked_by_user ? 'active' : ''}`}
                          onClick={() => handleLike(comment.id)}
                        >
                          <FiThumbsUp /> {comment.likes}
                        </button>
                        <button
                          className={`dislike-btn ${comment.is_disliked_by_user ? 'active' : ''}`}
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
              <p className="no-comments">There are no comments</p>
            )}
          </div>

          <div className="comment-input-section">
            <input
              type="text"
              className="comment-input"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="send-comment-btn" onClick={handleSendComment}><FiArrowUp /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
