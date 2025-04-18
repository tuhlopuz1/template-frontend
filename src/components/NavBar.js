import { Link } from "wouter";
import Logo from "./Logo";
import '../styles/navbar.css'

const Navbar = ({ currentPath }) => {
  return (
    <nav>
  <div className="navbar-container">
    <div className="navbar-inner">
      <Link href="/">
        <a className="navbar-logo">
          <Logo />
        </a>
      </Link>

      <div className="nav-links">
        <Link href="/">
          <a className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>Home</a>
        </Link>
      </div>

      <div className="nav-auth">
        <Link href="/login">
          <a className="login-btn">Log in</a>
        </Link>
        <Link href="/signup">
          <a className="signup-btn">Sign up</a>
        </Link>
      </div>
    </div>
  </div>
</nav>

  );
};

export default Navbar;
