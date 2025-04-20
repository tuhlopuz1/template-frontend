import { Link } from "react-router-dom";
import Logo from "./Logo";
import "../styles/navbar.css";

const Navbar = ({ currentPath }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          <Link href="/">
            <a className="logo-link">
              <Logo />
            </a>
          </Link>


          <div className="navbar-actions">
            <Link href="/login">
              <a className="btn login-btn">
                Log in
              </a>
            </Link>
            <Link href="/signup">
              <a className="btn signup-btn">
                Sign up
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
