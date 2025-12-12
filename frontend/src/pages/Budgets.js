import React, { useState, useEffect } from 'react';
import BudgetForm from '../components/BudgetForm';
import { budgetsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // для отображения формы
  const [editingBudget, setEditingBudget] = useState(null); // для редактирования

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await budgetsAPI.getAll();
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = () => {
    setEditingBudget(null); // создание нового
    setShowForm(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget); // редактирование существующего
    setShowForm(true);
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот бюджет?')) {
      try {
        await budgetsAPI.delete(id);
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Ошибка при удалении бюджета');
      }
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingBudget(null);
    fetchBudgets(); // обновляем список
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка бюджетов...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Бюджеты</h1>
        <button 
          onClick={handleAddBudget}
          style={styles.addButton}
        >
          + Новый бюджет
        </button>
      </div>
      
      {/* Форма создания/редактирования */}
      {showForm && (
        <div style={styles.formContainer}>
          <BudgetForm 
            budget={editingBudget}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
      
      {/* Список бюджетов */}
      {!showForm && budgets.length === 0 ? (
        <div style={styles.empty}>
          <p>У вас пока нет бюджетов</p>
          <button 
            onClick={handleAddBudget}
            style={styles.emptyButton}
          >
            Создать первый бюджет
          </button>
        </div>
      ) : !showForm && (
        <div style={styles.grid}>
          {budgets.map(budget => {
            const percentage = budget.amount > 0 ? (budget.spentAmount / budget.amount) * 100 : 0;
            const progressColor = percentage > 100 ? '#c62828' : 
                                 percentage > 80 ? '#f57c00' : '#2e7d32';
            
            return (
              <div key={budget.id} style={styles.budgetCard}>
                <div style={styles.budgetHeader}>
                  <h3>{budget.name}</h3>
                  <div style={styles.actions}>
                    <button 
                      onClick={() => handleEditBudget(budget)}
                      style={styles.editButton}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(budget.id)}
                      style={styles.deleteButton}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div style={styles.budgetInfo}>
                  <div><strong>Категория:</strong> {budget.categoryName}</div>
                  <div><strong>Период:</strong> {formatDate(budget.startDate)} - {formatDate(budget.endDate)}</div>
                  <div style={styles.amounts}>
                    <div>
                      <strong>Бюджет:</strong> {formatCurrency(budget.amount)}
                    </div>
                    <div>
                      <strong>Потрачено:</strong> {formatCurrency(budget.spentAmount)}
                    </div>
                  </div>
                  <div style={styles.remaining}>
                    <strong>Осталось:</strong> {formatCurrency(budget.remainingAmount)}
                  </div>
                </div>
                
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                  <div style={styles.progressInfo}>
                    <span style={{ color: progressColor, fontWeight: 'bold' }}>
                      {percentage.toFixed(1)}%
                    </span>
                    <span>
                      {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
  },
  addButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  addButtonHover: {
    backgroundColor: '#1565c0',
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
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    marginTop: '1rem',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  budgetCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  budgetCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.25rem',
    color: '#c62828',
  },
  budgetInfo: {
    marginBottom: '1.5rem',
  },
  amounts: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  remaining: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: '1rem',
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.3s',
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
  },
};

// Добавляем CSS анимацию
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .addButton:hover {
    background-color: #1565c0;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .budgetCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`, styleSheet.cssRules.length);

export default Budgets;