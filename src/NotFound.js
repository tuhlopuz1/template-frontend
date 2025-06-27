import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/notfound.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <button onClick={goBack}>Вернуться назад</button>
    </div>
  );
};

export default NotFoundPage;
