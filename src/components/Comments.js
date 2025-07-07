import { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiX, FiArrowUp } from "react-icons/fi";
import { Link } from 'react-router-dom';
import apiRequest from './Requests';
import '../styles/comments.css'

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
      auth: true,
    });

    if (!response.ok) {
      console.error('Ошибка при отправке лайка/дизлайка:', response.statusText);
      console.log(response);
    }
  } catch (error) {
    console.error('Ошибка при отправке лайка/дизлайка:', error);
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

function CommentsSection({ videoId, showComments, toggleComments }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (showComments && videoId) {
      fetchComments(videoId).then((loadedComments) => {
        setComments(loadedComments);
      });
    }
  }, [showComments, videoId]);

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
    if (!newComment.trim()) return;

    const result = await sendComment(videoId, newComment.trim());
    if (result) {
      setComments((prev) => [
        ...prev,
        {
          ...result,
          user_id: localStorage.getItem('id'),
          user_name: localStorage.getItem('name'),
          user_username: localStorage.getItem('username'),
          content: newComment.trim(),
          likes: 0,
          dislikes: 0,
          is_liked_by_user: false,
          is_disliked_by_user: false
        }
      ]);
      setNewComment('');
    }
  };

  return (
    <div className={`comment-section ${showComments ? 'open' : ''}`}>
      <div className="comments-header">
        <h3>{comments.length} Comments</h3>
        <button className="close-comments-btn" onClick={toggleComments}><FiX size={25} /></button>
      </div>

      <div className="comments-content">
        {comments.length > 0 ? (
          comments.map((comment, i) => (
            <div key={i} className="comment-item">
              <Link to={`/user/${comment.user_username}`}>
                <img
                  src={`https://api.vickz.ru/get-profile-picture/${comment.user_id}`}
                  alt={comment.user_id}
                  className="comment-avatar"
                />
              </Link>
              <div className="comment-body">
                <div className="comment-header">
                  <Link to={`/user/${comment.user_username}`} className="black-link">
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
  );
}

export default CommentsSection;
