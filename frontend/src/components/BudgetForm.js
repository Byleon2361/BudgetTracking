import React, { useState, useEffect } from 'react';
import { categoriesAPI, budgetsAPI } from '../services/api';

const BudgetForm = ({ budget, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
    categoryId: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount.toString(),
        startDate: budget.startDate.split('T')[0],
        endDate: budget.endDate.split('T')[0],
        categoryId: budget.categoryId.toString()
      });
    }
  }, [budget]);

const fetchCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    // Фильтруем только категории РАСХОДОВ (type = 2)
    const expenseCategories = response.data.filter(cat => cat.type === 2);
    setCategories(expenseCategories);
    
    if (expenseCategories.length === 0) {
      setError('Сначала создайте категорию расходов');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    setError('Ошибка загрузки категорий');
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Проверка дат
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      setError('Дата окончания должна быть позже даты начала');
      setLoading(false);
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId)
      };

      if (budget) {
        await budgetsAPI.update(budget.id, data);
      } else {
        await budgetsAPI.create(data);
      }

      onSave();
    } catch (error) {
      setError(error.response?.data || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={styles.formContainer}>
      <h2>{budget ? 'Редактировать бюджет' : 'Новый бюджет'}</h2>
      
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label>Название бюджета</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
            placeholder="Например: Питание на месяц"
          />
        </div>

        <div style={styles.formGroup}>
          <label>Категория расходов</label>
          <select 
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Сумма бюджета</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            style={styles.input}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
          />
        </div>

        <div style={styles.dateRow}>
          <div style={styles.formGroup}>
            <label>Дата начала</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>Дата окончания</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.preview}>
          <h3>Предпросмотр:</h3>
          <div style={styles.previewContent}>
            <div><strong>Название:</strong> {formData.name || 'Не указано'}</div>
            <div><strong>Категория:</strong> {
              categories.find(c => c.id.toString() === formData.categoryId)?.name || 'Не выбрана'
            }</div>
            <div><strong>Сумма:</strong> {formData.amount ? `${formData.amount} ₽` : 'Не указана'}</div>
            <div><strong>Период:</strong> {formData.startDate} - {formData.endDate}</div>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (budget ? 'Сохранить' : 'Добавить')}
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
    maxWidth: '600px',
    margin: '0 auto'
  },
  formGroup: {
    marginBottom: '1.5rem'
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
  dateRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  preview: {
    backgroundColor: '#f9f9f9',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1.5rem'
  },
  previewContent: {
    marginTop: '0.5rem'
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

export default BudgetForm;