import { useState } from 'react';
import { useLocation } from 'wouter';
import { Link } from 'react-router-dom';
import Logo from './components/Logo';
import { validateSignup } from './components/validation';
import './styles/signup.css';
import Navbar from './components/NavBar';


const SignupPage = () => {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationResult = validateSignup(formData);

    if (validationResult.isValid) {
      console.log('Signup successful!', formData);
      alert('Signup successful! Welcome to AppName!');
      setLocation('/');
    } else {
      setErrors(validationResult.errors);
    }
  };

  return (
    <div className="signup-container">
        <Navbar/>
      <div className="signup-box">
        <Link to="/" className="back-button">
          <svg id="close-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </Link>
        <div className="signup-header">
          <div className="logo-wrapper">
            <Logo size="large" />
          </div>
          <h2>Create your account</h2>
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Log in
            </Link>
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Email address"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="username" className="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="Username"
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
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

            Sign up

          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
