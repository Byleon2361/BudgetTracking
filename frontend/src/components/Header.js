// components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <Link to="/" style={styles.logoLink}>💰 Budget Tracker</Link>
        </div>
        
        <nav style={styles.nav}>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.navLink}>Дашборд</Link>
              <Link to="/transactions" style={styles.navLink}>Транзакции</Link>
              <Link to="/categories" style={styles.navLink}>Категории</Link>
              <Link to="/budgets" style={styles.navLink}>Бюджеты</Link>
              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  <div style={styles.username}>{user.unique_name}</div>
                  {user.email && (
                    <div style={styles.userEmail}>{user.email}</div>
                  )}
                </div>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  Выйти
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Вход</Link>
              <Link to="/register" style={styles.navLink}>Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#1976d2',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  logoLink: {
    color: 'white',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  userInfo: {
    textAlign: 'right',
    lineHeight: '1.4',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.85rem',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    color: 'white',
    border: '1px solid white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

// Добавляем CSS анимацию
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    .navLink:hover {
      background-color: rgba(255,255,255,0.1);
    }
  `, styleSheet.cssRules.length);

  styleSheet.insertRule(`
    .logoutButton:hover {
      background-color: rgba(255,255,255,0.1);
    }
  `, styleSheet.cssRules.length);
}

export default Header;