import '../styles/logo.css';

const Logo = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  }[size] || 'logo-medium';

  return (
    <div className="logo">
      <div className={`logo-icon ${sizeClass}`}>
        <span className="logo-letter">A</span>
      </div>
      <span className="logo-text">AppName</span>
    </div>
  );
};

export default Logo;
