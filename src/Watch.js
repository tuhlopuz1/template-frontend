import Sidebar from "./components/Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './styles/main.css';
import CustomVideoPlayer from "./components/CustomVideoPlayer";
import CommentsSection from './components/Comments';
import { FiArrowLeft } from "react-icons/fi";

function WatchPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [showComments, setShowComments] = useState(false);
    const [video, setVideo] = useState(null);

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

    const isPortrait = window.matchMedia('(orientation: portrait)').matches;

    return (
        <div className="main-layout">
            <Sidebar />
            <div className={`content-area ${showComments ? 'with-comments' : ''}`}>

                {/* Кнопка назад */}
                <button className="back-to-main-button" onClick={() => navigate(-1)}>
                    <FiArrowLeft size={30}/>
                </button>

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

                {video && (
                    <CommentsSection
                        videoId={video.id}
                        showComments={showComments}
                        toggleComments={toggleComments}
                    />
                )}
            </div>
        </div>
    );
}

export default WatchPage;
