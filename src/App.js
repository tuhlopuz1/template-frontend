import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './Welcome.js';
import SignupPage from './SignUp.js';
import LogInPage from './Login.js';
import MainPage from './Main.js'
import ProfilePage from './Profile.js';
import SearchPage from './Search.js';
import NotFoundPage from './NotFound.js';
import UserPage from './User.js';
import WatchPage from './Watch.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/following" element={<MainPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
      </Routes>
    </Router>
  );
}

export default App;