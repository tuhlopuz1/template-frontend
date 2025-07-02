import Sidebar from "./components/Sidebar";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import './styles/main.css';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiX, FiShare2, FiHeart } from "react-icons/fi";
import CustomVideoPlayer from "./components/CustomVideoPlayer";

function WatchPage() {
    const { id } = useParams();
    const [showComments, setShowComments] = useState(false);
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);

    const toggleComments = () => {
        setShowComments((prev) => !prev);
    };

    useEffect(() => {
        const fetchVideoById = async () => {
            const access_token = localStorage.getItem('access_token');

            if (!access_token) {
                localStorage.clear();
                window.location.href = '/';
                return;
            }

            try {
                const response = await fetch(`https://api.vickz.ru/get-video-by-id/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    }
                });

                if (!response.ok) {
                    console.error('Ошибка загрузки видео:', response);
                    return;
                }

                const result = await response.json();
                setVideo(result);
            } catch (error) {
                console.error('Ошибка при загрузке видео:', error);
            }
        };

        if (id) {
            fetchVideoById();
        }
    }, [id]);

    useEffect(() => {
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
        setComments(exampleComments);
    }, []);

    const isPortrait = window.matchMedia('(orientation: portrait)').matches;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className={`content-area ${showComments ? 'with-comments' : ''}`}>

                {showComments && isPortrait && (
                    <div className="mobile-overlay" onClick={toggleComments}></div>
                )}

                <div className={`video-scroll-container no-scrollbar ${showComments && isPortrait ? 'lock-scroll' : ''}`}>
                    <div className="video-wrapper">
                        {video ? (
                            <CustomVideoPlayer
                                video={video}
                                toggleComments={toggleComments}
                                isActive={true}
                            />
                        ) : (
                            <div className="loading-placeholder">
                                <div className="loader" />
                            </div>
                        )}
                    </div>
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

export default WatchPage;
