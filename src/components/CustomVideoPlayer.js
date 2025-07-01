  import { useRef, useState, useEffect } from "react";
  import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiShare2, FiPlay, FiMusic } from "react-icons/fi";
  import { Link } from "react-router-dom";
  import "../styles/player.css"
  function CustomVideoPlayer({ video, toggleComments, isActive }) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const actionBtnSize = 30;

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

    const handleDoubleClick = () => {
      console.log('Double click - Like animation!');
      // Тут можешь добавить анимацию лайка
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

    const checkSound = () => {
      console.log('check sound')
    }

    // ===== Автовоспроизведение на фокусе =====
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            if (videoRef.current) {
              videoRef.current.currentTime = 0; // Запуск с начала
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
          onClick={togglePlay}
          onDoubleClick={handleDoubleClick}
          style={{ position: 'relative' }}
        >
          <video
            className="main-video"
            src={video.serv_url}
            ref={videoRef}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded} // автоповтор
            preload={isActive ? "auto" : "metadata"}
          />

          {/* Полупрозрачный треугольник, когда видео на паузе */}
          {!isPlaying && (
            <div className="play-overlay action-btn">
              <FiPlay size={actionBtnSize} color="white" />
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
          <button className={`action-btn like ${video.is_liked_by_user ? 'liked' : ''}`}><FiThumbsUp size={actionBtnSize} /></button>
          <p className="stat-amount">{video.likes}</p>
          <button className={`action-btn dislike ${video.is_disliked_by_user ? 'disliked' : ''}`}><FiThumbsDown size={actionBtnSize} /></button>
          <p className="stat-amount">{video.dislikes}</p>
          <button className="action-btn comment-toggle" onClick={toggleComments}><FiMessageCircle size={actionBtnSize} /></button>
          <p className="stat-amount">{video.comments}</p>
          <button className="action-btn share" ><FiShare2 size={actionBtnSize} /></button>
          <p className="stat-amount">{video.shares}</p>
        </div>

        <div className="video-info-bar">
          <div className="video-info-header">
            <img src={'https://api.vickz.ru/get-profile-picture/'+video.author_id} alt={video.author} className="author-avatar" />
            <p className="author-nickname">{video.author_name}</p>
            <button className={`subscribe-btn ${video.isSubscribed ? 'subscribed' : ''}`}>
              {video.isSubscribed ? "Unfollow" : "Follow"}
            </button>
          </div>
          <p className="video-description">{video.description}</p>
        </div>

        <div className="sound-description-panel">

          <Link to="/" className="row">
            <FiMusic onClick={ checkSound } className="music-icon" size={15} />
            <p className="sound-name">original sound</p>
          </Link>

        </div>


      </>
    );
  }

  export default CustomVideoPlayer;
