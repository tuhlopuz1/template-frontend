import '../styles/footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} Vickz, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
