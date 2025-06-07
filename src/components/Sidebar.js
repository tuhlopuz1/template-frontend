import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { FiUser, FiGrid, FiSearch, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import '../styles/sidebar.css';

const Sidebar = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/profile', icon: <FiUser size={20} />, label: 'Профиль' },
    { path: '/profile/dashboard', icon: <FiGrid size={20} />, label: 'Дашборд' },
    { path: '/profile/search', icon: <FiSearch size={20} />, label: 'Поиск' },
    { path: '/profile/settings', icon: <FiSettings size={20} />, label: 'Настройки' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="mobile-menu-button">
        <button
          onClick={toggleSidebar}
          className="menu-toggle"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            Личный кабинет
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={`menu-item ${location === item.path ? 'active' : ''}`}
                  >
                    <span className="menu-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <Link 
              href="/"
              className="logout-button"
            >
              <span className="logout-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              Выйти
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;