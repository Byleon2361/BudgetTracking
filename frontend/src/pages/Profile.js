import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1>Профиль</h1>
      <div style={styles.profileCard}>
        <h2>Информация о пользователе</h2>
        <div style={styles.info}>
          <div style={styles.infoRow}>
            <strong>Имя пользователя:</strong> {user?.username}
          </div>
          <div style={styles.infoRow}>
            <strong>Email:</strong> {user?.email}
          </div>
          <div style={styles.infoRow}>
            <strong>Дата регистрации:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginTop: '2rem',
  },
  info: {
    marginTop: '1rem',
  },
  infoRow: {
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
  },
};

export default Profile;