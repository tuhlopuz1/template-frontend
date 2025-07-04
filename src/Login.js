import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './components/Logo';
import { validateLogin } from './components/validation';
import './styles/signup.css';
import Navbar from './components/NavBar';


const LogInPage = () => {
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    console.log(formData)
    e.preventDefault();

    const validationResult = validateLogin(formData);
    formData.username = formData.identifier
    console.log(validationResult)
    if (validationResult.isValid) {
      

      fetch('https://api.vickz.ru/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => {
          console.log(response)
          if (!response.ok) {
            return response.json().then(errorData => {
              throw new Error(errorData.msg || 'Login error');
            });
          }
          return response.json();
        })
        .then(result => {
          console.log('Ответ от сервера:', result);

          localStorage.setItem('access_token', result.access_token)
          localStorage.setItem('refresh_token', result.refresh_token)


          window.location.href = '#/main';
        })
        .catch(error => {
          console.error('Произошла ошибка:', error);
          setServerError(error.message);
        });

      
    } else {
      setErrors(validationResult.errors);
    }
  };

  return (
    <div className="signup-container">
        <Navbar/>
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
          <h2>Log in to your account</h2>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="link">
              Sign up
            </Link>
          </p>
          {serverError && <p className="server-error">{serverError}</p>}
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier" className="sr-only">Email address or username</label>
            <input
              id="identifier"
              name="identifier"
              type="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className={`form-input ${errors.identifier ? 'input-error' : ''}`}
              placeholder="Email address or username"
            />
            {errors.identifier && <p className="error-text">{errors.identifier}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Password"
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>


          <button type="submit" className="submit-button">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogInPage;
