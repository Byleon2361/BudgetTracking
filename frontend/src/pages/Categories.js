import React, { useState, useEffect } from 'react';
import CategoryForm from '../components/CategoryForm';
import { categoriesAPI } from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryType, setCategoryType] = useState(2);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = (type) => {
    setEditingCategory(null);
    setCategoryType(type);
    setShowForm(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryType(category.type);
    setShowForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await categoriesAPI.delete(id);
        fetchCategories();
      } catch (error) {
        alert(error.response?.data || 'Ошибка при удалении категории');
      }
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingCategory(null);
    fetchCategories();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const incomeCategories = categories.filter(c => c.type === 1);
  const expenseCategories = categories.filter(c => c.type === 2);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка категорий...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Категории</h1>
        <div style={styles.buttonGroup}>
          <button 
            onClick={() => handleAddCategory(1)}
            style={styles.incomeButton}
          >
            + Категория доходов
          </button>
          <button 
            onClick={() => handleAddCategory(2)}
            style={styles.expenseButton}
          >
            + Категория расходов
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.formContainer}>
          <CategoryForm 
            category={editingCategory}
            initialType={categoryType}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {!showForm && (
        <div style={styles.categoriesGrid}>
          <div style={styles.categorySection}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.incomeIcon}>📈</span>
              Категории доходов
              <span style={styles.count}>({incomeCategories.length})</span>
            </h2>
            
            {incomeCategories.length === 0 ? (
              <div style={styles.emptySection}>
                <p>Нет категорий доходов</p>
                <button 
                  onClick={() => handleAddCategory(1)}
                  style={styles.emptyButton}
                >
                  Создать категорию доходов
                </button>
              </div>
            ) : (
              <div style={styles.cardsGrid}>
                {incomeCategories.map(category => (
                  <div key={category.id} style={styles.categoryCard}>
                    <div style={styles.cardHeader}>
                      <div style={{...styles.colorDot, backgroundColor: category.color}}></div>
                      <h3>{category.name}</h3>
                      <div style={styles.cardActions}>
                        <button 
                          onClick={() => handleEditCategory(category)}
                          style={styles.editButton}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          style={styles.deleteButton}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={styles.cardDescription}>
                      {category.description || 'Нет описания'}
                    </div>
                    <div style={styles.cardMeta}>
                      <span>Тип: Доход</span>
                      {category.icon && <span>Иконка: {category.icon}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.categorySection}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.expenseIcon}>📉</span>
              Категории расходов
              <span style={styles.count}>({expenseCategories.length})</span>
            </h2>
            
            {expenseCategories.length === 0 ? (
              <div style={styles.emptySection}>
                <p>Нет категорий расходов</p>
                <button 
                  onClick={() => handleAddCategory(2)}
                  style={styles.emptyButton}
                >
                  Создать категорию расходов
                </button>
                <p style={styles.note}>
                  <strong>Важно:</strong> Для создания бюджета нужны категории расходов!
                </p>
              </div>
            ) : (
              <div style={styles.cardsGrid}>
                {expenseCategories.map(category => (
                  <div key={category.id} style={styles.categoryCard}>
                    <div style={styles.cardHeader}>
                      <div style={{...styles.colorDot, backgroundColor: category.color}}></div>
                      <h3>{category.name}</h3>
                      <div style={styles.cardActions}>
                        <button 
                          onClick={() => handleEditCategory(category)}
                          style={styles.editButton}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category.id)}
                          style={styles.deleteButton}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={styles.cardDescription}>
                      {category.description || 'Нет описания'}
                    </div>
                    <div style={styles.cardMeta}>
                      <span>Тип: Расход</span>
                      {category.icon && <span>Иконка: {category.icon}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  incomeButton: {
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  expenseButton: {
    backgroundColor: '#c62828',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  '@media (max-width: 900px)': {
    categoriesGrid: {
      gridTemplateColumns: '1fr',
    },
  },
  categorySection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f0f0f0',
  },
  incomeIcon: {
    color: '#2e7d32',
  },
  expenseIcon: {
    color: '#c62828',
  },
  count: {
    marginLeft: 'auto',
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: 'normal',
  },
  emptySection: {
    textAlign: 'center',
    padding: '2rem 0',
    color: '#666',
  },
  emptyButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    marginTop: '1rem',
    cursor: 'pointer',
  },
  note: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '4px',
    color: '#856404',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  categoryCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  colorDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  cardActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '0.25rem',
  },
  editButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '0.25rem',
    color: '#c62828',
  },
  cardDescription: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.75rem',
    minHeight: '40px',
  },
  cardMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#888',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '0.75rem',
  },
};

export default Categories;