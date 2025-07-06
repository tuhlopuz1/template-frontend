import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import Navbar from './components/NavBar';
import './styles/signup.css';

const ProfileSetupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    avatar: null,
    bio: ''
  });

  const [preview, setPreview] = useState(null);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'avatar' && files.length > 0) {
      setFormData({
        ...formData,
        avatar: files[0]
      });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const token = localStorage.getItem('access_token');

    try {
      // Первый запрос: обновляем описание
      const descriptionResponse = await fetch('https://api.vickz.ru/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: formData.bio })
      });

      if (!descriptionResponse.ok) {
        const errorData = await descriptionResponse.json();
        throw new Error(errorData.msg || 'Error updating description');
      }

      // Второй запрос: загружаем аватар
      if (formData.avatar) {
        const avatarData = new FormData();
        avatarData.append('file', formData.avatar);

        const avatarResponse = await fetch('https://api.vickz.ru/profile-picture', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: avatarData
        });

        if (!avatarResponse.ok) {
          const errorData = await avatarResponse.json();
          console.log(errorData)
          throw new Error(errorData.msg || 'Error uploading avatar');
        }
      }

      navigate('/main');

    } catch (error) {
      console.error('Error occurred:', error);
      setServerError(error.message);
    }
  };

  const handleSkip = () => {
    window.location.href = '/#/main';
  };

  return (
    <div className="signup-container">
      <Navbar />
      <div className="signup-box">
        <Link to="/" className="back-button">
          <svg id="close-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </Link>
        <div className="signup-header">
          <div className="logo-wrapper">
            <Logo size="large" />
          </div>
          <h2>Now let's customize your profile</h2>
          <p className='login-suggest'>
            You can skip this step if you want.
          </p>
          {serverError && <p className="server-error">{serverError}</p>}
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="avatar" className="sr-only">Profile Picture</label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="form-input"
            />
            {preview && <img src={preview} alt="Avatar Preview" className="avatar-preview" />}
          </div>

          <div className="form-group">
            <label htmlFor="bio" className="sr-only">Profile Description</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-input"
              placeholder="Tell us something about yourself"
              rows={4}
            />
          </div>

          <button type="submit" className="submit-button">
            Save and Continue
          </button>

          <button type="button" className="skip-button" onClick={handleSkip}>
            Skip
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
