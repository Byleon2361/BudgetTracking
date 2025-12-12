import React, { useState, useEffect } from 'react';
import { transactionsAPI, categoriesAPI } from '../services/api';

const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    type: '2' // По умолчанию расход
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date.split('T')[0],
        categoryId: transaction.categoryId.toString(),
        type: transaction.type.toString()
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Введите корректную сумму';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Введите описание';
    }
    
    if (!formData.date) {
      newErrors.date = 'Выберите дату';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Выберите категорию';
    }
    
    if (!formData.type) {
      newErrors.type = 'Выберите тип';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const transactionData = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        categoryId: parseInt(formData.categoryId),
        type: parseInt(formData.type)
      };
      
      if (transaction?.id) {
        // Редактирование существующей транзакции
        await transactionsAPI.update(transaction.id, transactionData);
      } else {
        // Создание новой транзакции
        await transactionsAPI.create(transactionData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Ошибка при сохранении транзакции');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2>{transaction ? 'Редактировать транзакцию' : 'Новая транзакция'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Тип транзакции *</label>
          <div style={styles.typeButtons}>
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'type', value: '1' } })}
              style={{
                ...styles.typeButton,
                ...(formData.type === '1' ? styles.typeButtonIncomeActive : styles.typeButtonIncome)
              }}
            >
              Доход
            </button>
            <button
              type="button"
              onClick={() => handleChange({ target: { name: 'type', value: '2' } })}
              style={{
                ...styles.typeButton,
                ...(formData.type === '2' ? styles.typeButtonExpenseActive : styles.typeButtonExpense)
              }}
            >
              Расход
            </button>
          </div>
          {errors.type && <span style={styles.error}>{errors.type}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Сумма *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            style={styles.input}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
          {errors.amount && <span style={styles.error}>{errors.amount}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Описание *</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={styles.input}
            placeholder="На что потратили или откуда доход"
            maxLength="200"
          />
          {errors.description && <span style={styles.error}>{errors.description}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Дата *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={styles.input}
          />
          {errors.date && <span style={styles.error}>{errors.date}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Категория *</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <span style={styles.error}>{errors.categoryId}</span>}
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (transaction?.id ? 'Сохранить изменения' : 'Создать транзакцию')}
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
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  typeButtons: {
    display: 'flex',
    gap: '1rem'
  },
  typeButton: {
    flex: 1,
    padding: '1rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  typeButtonIncome: {
    backgroundColor: '#f0f9f0',
    color: '#2e7d32'
  },
  typeButtonIncomeActive: {
    backgroundColor: '#2e7d32',
    color: 'white'
  },
  typeButtonExpense: {
    backgroundColor: '#fef0f0',
    color: '#c62828'
  },
  typeButtonExpenseActive: {
    backgroundColor: '#c62828',
    color: 'white'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem'
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#333'
  },
  submitButton: {
    flex: 2,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#1976d2',
    color: 'white',
    fontWeight: 'bold'
  },
  error: {
    color: '#c62828',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
    display: 'block'
  }
};

export default TransactionForm;