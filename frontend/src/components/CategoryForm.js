import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api';

const CategoryForm = ({ category, initialType = 2, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: initialType,
    color: '#1976d2',
    icon: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        type: category.type,
        color: category.color,
        icon: category.icon
      });
    } else {
      setFormData(prev => ({
        ...prev,
        type: initialType
      }));
    }
  }, [category, initialType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (category) {
        await categoriesAPI.update(category.id, formData);
      } else {
        await categoriesAPI.create(formData);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' ? parseInt(value) : value
    }));
  };

  const colorOptions = [
    '#1976d2', '#2e7d32', '#d32f2f', '#ed6c02', '#9c27b0',
    '#0288d1', '#388e3c', '#c2185b', '#f57c00', '#7b1fa2'
  ];

  return (
    <div style={styles.formContainer}>
      <h2>{category ? 'Редактировать категорию' : 'Новая категория'}</h2>
      
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Тип</label>
          <select 
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
          >
            <option value={1}>Доход</option>
            <option value={2}>Расход</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Название</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
            rows="3"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Цвет</label>
          <div style={styles.colorPicker}>
            {colorOptions.map(color => (
              <button
                key={color}
                type="button"
                style={{
                  ...styles.colorOption,
                  backgroundColor: color,
                  border: formData.color === color ? '2px solid #333' : '1px solid #ddd'
                }}
                onClick={() => setFormData({...formData, color})}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            style={styles.colorInput}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Иконка (опционально)</label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            style={styles.input}
            placeholder="emoji или название иконки"
          />
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (category ? 'Сохранить' : 'Добавить')}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '500px',
    margin: '0 auto'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical'
  },
  colorPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  colorOption: {
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none'
  },
  colorInput: {
    width: '100%',
    height: '40px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.75rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    padding: '0.75rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center'
  }
};

export default CategoryForm;