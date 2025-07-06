import { useRef, useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiShare2, FiPlay, FiMusic } from "react-icons/fi";
import { Link } from "react-router-dom";
import "../styles/player.css";

function CustomVideoPlayer({ video, toggleComments, isActive }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const clickTimeout = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isLiked, setIsLiked] = useState(video.is_liked_by_user);
  const [likeCount, setLikeCount] = useState(video.likes);

  const [isDisliked, setIsDisliked] = useState(video.is_disliked_by_user);
  const [dislikeCount, setDislikeCount] = useState(video.dislikes);

  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const actionBtnSize = 30;

  // =====================
  // ОДИНОЧНЫЙ И ДВОЙНОЙ КЛИК
  // =====================
  const handleVideoClick = (e) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    if (e.detail === 2) {
      // Двойной клик
      handleLike();
      triggerLikeAnimation();
    } else if (e.detail === 1) {
      // Одиночный клик
      clickTimeout.current = setTimeout(() => {
        togglePlay();
        clickTimeout.current = null;
      }, 250);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleLike = async () => {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      window.location.href = '/#/login';
      return;
    }

    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikeCount(prev => newLikeState ? prev + 1 : prev - 1);

    // Если пользователь лайкает, автоматически убираем дизлайк
    if (newLikeState && isDisliked) {
      setIsDisliked(false);
      setDislikeCount(prev => prev - 1);
    }

    try {
      await fetch(`https://api.vickz.ru/like-video?uuid=${video.id}&like=${true}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
    } catch (error) {
      console.error('Ошибка при отправке лайка:', error);
    }
  };

  const handleDislike = async () => {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      window.location.href = '/#/login';
      return;
    }

    const newDislikeState = !isDisliked;
    setIsDisliked(newDislikeState);
    setDislikeCount(prev => newDislikeState ? prev + 1 : prev - 1);

    // Если пользователь дизлайкает, автоматически убираем лайк
    if (newDislikeState && isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    }

    try {
      await fetch(`https://api.vickz.ru/like-video?uuid=${video.id}&like=${false}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
    } catch (error) {
      console.error('Ошибка при отправке дизлайка:', error);
    }
  };

  const triggerLikeAnimation = () => {
    setShowLikeAnimation(true);
    setTimeout(() => {
      setShowLikeAnimation(false);
    }, 600);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;

    const progressBar = e.target.getBoundingClientRect();
    const clickX = e.clientX - progressBar.left;
    const newTime = (clickX / progressBar.width) * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Автовоспроизведение по Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.7 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className="video-container"
        ref={containerRef}
        onClick={handleVideoClick}
        style={{ position: 'relative' }}
      >
        <video
          className="main-video"
          src={video.serv_url}
          ref={videoRef}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload={isActive ? "auto" : "metadata"}
        />

        {!isPlaying && (
          <div className="play-overlay action-btn">
            <FiPlay size={actionBtnSize} color="white" />
          </div>
        )}

        {showLikeAnimation && (
          <div className="like-animation">
            <FiThumbsUp size={100} />
          </div>
        )}

        <div className="custom-progress-bar" onClick={handleSeek}>
          <div
            className="custom-progress"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>

      <div className="action-buttons">
        <button className={`action-btn like ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <FiThumbsUp size={actionBtnSize} />
        </button>
        <p className="stat-amount">{likeCount}</p>

        <button className={`action-btn dislike ${isDisliked ? 'liked' : ''}`} onClick={handleDislike}>
          <FiThumbsDown size={actionBtnSize} />
        </button>
        <p className="stat-amount">{dislikeCount}</p>

        <button className="action-btn comment-toggle" onClick={toggleComments}>
          <FiMessageCircle size={actionBtnSize} />
        </button>
        <p className="stat-amount">{video.comments}</p>

        <button className="action-btn share">
          <FiShare2 size={actionBtnSize} />
        </button>
        <p className="stat-amount">{video.shares}</p>
      </div>

      <div className="video-info-bar">
        <div className="video-info-header">
          <Link to={`/user/${video.author_username}`}>
            <img src={`https://api.vickz.ru/get-profile-picture/${video.author_id}`} alt={video.author} className="author-avatar" />
          </Link>
          <Link to={`/user/${video.author_username}`}>
            <p className="author-nickname">{video.author_name}</p>
          </Link>
          <button className={`subscribe-btn ${video.isSubscribed ? 'subscribed' : ''}`}>
            {video.isSubscribed ? "Unfollow" : "Follow"}
          </button>
        </div>
        <p className="video-description">{video.description}</p>
      </div>

      <div className="sound-description-panel">
        <Link to="/#/sounds" className="row">
          <FiMusic className="music-icon" size={15} />
          <p className="sound-name">original sound</p>
        </Link>
      </div>
    </>
  );
}

export default CustomVideoPlayer;
