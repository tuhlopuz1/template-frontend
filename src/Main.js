import Sidebar from "./components/Sidebar";
import { useState } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle } from "react-icons/fi";
function MainPage() {
  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="main-layout">
      <Sidebar />

      <div className="video-section">
        <div className="video-container">
          <video
            className="main-video"
            src="your-video-url.mp4"
            controls
            playsInline
          />
        </div>

        <div className="action-buttons">
          <button className="action-btn like"><FiThumbsUp /></button>
          <button className="action-btn dislike"><FiThumbsDown /></button>
          <button className="action-btn comment-toggle" onClick={toggleComments}><FiMessageCircle size={22}/></button>
        </div>
      </div>

      <div className={`comment-section ${showComments ? 'open' : ''}`}>
        <div className="comments-header">
          <h3>Комментарии</h3>
          <button onClick={toggleComments}>Закрыть</button>
        </div>
        <div className="comments-content">
          <p>Комментарий 1</p>
          <p>Комментарий 2</p>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
