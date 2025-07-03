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

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');

    const formDataToSend = new FormData();
    formDataToSend.append('avatar', formData.avatar);
    formDataToSend.append('bio', formData.bio);

    fetch('https://api.vickz.ru/profile-setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: formDataToSend
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.msg || 'Profile setup error');
          });
        }
        return response.json();
      })
      .then(result => {
        console.log('Profile setup response:', result);
        navigate('/main');
      })
      .catch(error => {
        console.error('Error occurred:', error);
        setServerError(error.message);
      });
  };

  const handleSkip = () => {
    window.location.href = '/#/main'
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
