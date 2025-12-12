import React, { useState, useEffect } from 'react';
import { categoriesAPI, transactionsAPI } from '../services/api';

const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 2, // Expense by default
    categoryId: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date.split('T')[0],
        type: transaction.type,
        categoryId: transaction.categoryId.toString()
      });
    }
  }, [transaction]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const data = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      type: formData.type,
      categoryId: parseInt(formData.categoryId)
    };

    if (transaction) {
      await transactionsAPI.update(transaction.id, data);
    } else {
      await transactionsAPI.create(data);
    }

    // Сбрасываем форму
    if (!transaction) {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 2,
        categoryId: ''
      });
    }

    // Успешное сохранение
    if (onSave) {
      onSave();
    }
    
  } catch (err) {
    console.error('Save error:', err);
    setError(err.response?.data || 'Ошибка сохранения транзакции');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' || name === 'categoryId' ? parseInt(value) : value
    }));
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div style={styles.formContainer}>
      <h2>{transaction ? 'Редактировать транзакцию' : 'Новая транзакция'}</h2>
      
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Тип</label>
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
          <label>Категория</label>
          <select 
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="">Выберите категорию</option>
            {filteredCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Сумма</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            style={styles.input}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label>Описание</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label>Дата</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (transaction ? 'Сохранить' : 'Добавить')}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            style={styles.cancelButton}
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
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold'
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
    marginBottom: '1rem'
  }
};

export default TransactionForm;