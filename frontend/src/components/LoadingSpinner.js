import React from 'react';

const LoadingSpinner = ({ size = 40, color = '#1976d2', text = 'Загрузка...' }) => {
  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.spinner,
          width: size,
          height: size,
          borderTopColor: color,
          borderRightColor: color,
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent'
        }}
      />
      {text && <div style={styles.text}>{text}</div>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  spinner: {
    borderWidth: '4px',
    borderStyle: 'solid',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    marginTop: '1rem',
    color: '#666',
    fontSize: '0.9rem'
  }
};

// Добавляем CSS анимацию
const addAnimation = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

addAnimation();

export default LoadingSpinner;