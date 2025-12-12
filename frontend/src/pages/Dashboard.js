import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Добавили useNavigate
import { transactionsAPI, budgetsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate(); // Добавили навигацию
  const [balance, setBalance] = useState(0);
  const [currentBudgets, setCurrentBudgets] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, budgetsRes, transactionsRes, summaryRes] = await Promise.all([
        transactionsAPI.getBalance(),
        budgetsAPI.getCurrent(),
        transactionsAPI.getAll({}),
        transactionsAPI.getSummary(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          new Date().toISOString()
        ),
      ]);

      setBalance(balanceRes.data);
      setCurrentBudgets(budgetsRes.data);
      setRecentTransactions(transactionsRes.data.slice(0, 5));
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = summary
    .filter(s => s.type === 1)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalExpense = summary
    .filter(s => s.type === 2)
    .reduce((sum, s) => sum + s.totalAmount, 0);

  // ОБРАБОТЧИКИ КНОПОК
  const handleAddTransaction = () => {
    console.log('Add transaction clicked');
    navigate('/transactions'); // или navigate('/transactions/new') если есть отдельная страница
  };

  const handleAddBudget = () => {
    console.log('Add budget clicked');
    navigate('/budgets'); // или navigate('/budgets/new')
  };

  const handleViewAllBudgets = () => {
    console.log('View all budgets clicked');
    navigate('/budgets');
  };

  const handleViewAllTransactions = () => {
    console.log('View all transactions clicked');
    navigate('/transactions');
  };

  const handleManageCategories = () => {
    console.log('Manage categories clicked');
    navigate('/categories');
  };

  // Обработчик клика по транзакции
  const handleTransactionClick = (id) => {
    console.log('Transaction clicked:', id);
    // Можно добавить модальное окно или переход на детальную страницу
  };

  // Обработчик клика по бюджету
  const handleBudgetClick = (id) => {
    console.log('Budget clicked:', id);
    // Можно добавить модальное окно или переход на детальную страницу
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Дашборд</h1>

      {/* Статистика */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard} onClick={() => console.log('Balance card clicked')}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statLabel}>Баланс</div>
            <div style={{
              ...styles.statValue,
              color: balance >= 0 ? '#2e7d32' : '#c62828'
            }}>
              {formatCurrency(balance)}
            </div>
          </div>
        </div>

        <div style={styles.statCard} onClick={() => console.log('Income card clicked')}>
          <div style={{...styles.statIcon, color: '#2e7d32'}}>📈</div>
          <div>
            <div style={styles.statLabel}>Доходы</div>
            <div style={{...styles.statValue, color: '#2e7d32'}}>
              {formatCurrency(totalIncome)}
            </div>
          </div>
        </div>

        <div style={styles.statCard} onClick={() => console.log('Expense card clicked')}>
          <div style={{...styles.statIcon, color: '#c62828'}}>📉</div>
          <div>
            <div style={styles.statLabel}>Расходы</div>
            <div style={{...styles.statValue, color: '#c62828'}}>
              {formatCurrency(totalExpense)}
            </div>
          </div>
        </div>
      </div>

      {/* Бюджеты и транзакции */}
      <div style={styles.grid}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Текущие бюджеты</h2>
            <button 
              onClick={handleAddBudget}
              style={styles.addButton}
            >
              + Добавить
            </button>
          </div>
          
          {currentBudgets.length === 0 ? (
            <div style={styles.emptyMessage}>
              <p>Нет активных бюджетов</p>
              <button 
                onClick={handleAddBudget}
                style={styles.emptyButton}
              >
                Создать первый бюджет
              </button>
            </div>
          ) : (
            currentBudgets.map((budget) => {
              const percentage = budget.amount > 0 ? (budget.spentAmount / budget.amount) * 100 : 0;
              
              return (
                <div 
                  key={budget.id} 
                  style={styles.budgetItem}
                  onClick={() => handleBudgetClick(budget.id)}
                >
                  <div style={styles.budgetHeader}>
                    <span style={styles.budgetName}>{budget.name}</span>
                    <span style={styles.budgetAmount}>
                      {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: percentage > 100 ? '#c62828' : percentage > 80 ? '#f57c00' : '#2e7d32',
                      }}
                    />
                  </div>
                  <div style={styles.budgetMeta}>
                    {budget.categoryName} • до {formatDate(budget.endDate)}
                  </div>
                </div>
              );
            })
          )}
          
          {currentBudgets.length > 0 && (
            <div style={styles.viewAllContainer}>
              <button 
                onClick={handleViewAllBudgets}
                style={styles.viewAllButton}
              >
                Показать все бюджеты →
              </button>
            </div>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Последние транзакции</h2>
            <button 
              onClick={handleAddTransaction}
              style={styles.addButton}
            >
              + Добавить
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={styles.emptyMessage}>
              <p>Нет транзакций</p>
              <button 
                onClick={handleAddTransaction}
                style={styles.emptyButton}
              >
                Добавить первую транзакцию
              </button>
            </div>
          ) : (
            <>
              <div style={styles.transactionsList}>
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    style={styles.transactionItem}
                    onClick={() => handleTransactionClick(transaction.id)}
                  >
                    <div style={styles.transactionInfo}>
                      <div style={styles.transactionDescription}>
                        {transaction.description}
                      </div>
                      <div style={styles.transactionCategory}>
                        {transaction.categoryName}
                      </div>
                    </div>
                    <div style={{
                      ...styles.transactionAmount,
                      color: transaction.type === 1 ? '#2e7d32' : '#c62828'
                    }}>
                      {transaction.type === 1 ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={styles.viewAllContainer}>
                <button 
                  onClick={handleViewAllTransactions}
                  style={styles.viewAllButton}
                >
                  Показать все транзакции →
                </button>
              </div>
            </>
          )}
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
  title: {
    margin: '0 0 2rem 0',
    color: '#333',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  statCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  statIcon: {
    fontSize: '2rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
  },
  '@media (max-width: 768px)': {
    grid: {
      gridTemplateColumns: '1fr',
    },
  },
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    margin: '0',
    fontSize: '1.25rem',
  },
  addButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  addButtonHover: {
    backgroundColor: '#1565c0',
  },
  emptyMessage: {
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
  budgetItem: {
    marginBottom: '1.5rem',
    padding: '1rem',
    border: '1px solid #eee',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  budgetItemHover: {
    backgroundColor: '#f9f9f9',
  },
  budgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  budgetName: {
    fontWeight: 'bold',
  },
  budgetAmount: {
    color: '#666',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  budgetMeta: {
    fontSize: '0.8rem',
    color: '#888',
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  transactionItemHover: {
    backgroundColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontWeight: 'bold',
    marginBottom: '0.25rem',
  },
  transactionCategory: {
    fontSize: '0.8rem',
    color: '#666',
  },
  transactionAmount: {
    fontWeight: 'bold',
    margin: '0 1rem',
  },
  transactionDate: {
    fontSize: '0.8rem',
    color: '#888',
  },
  viewAllContainer: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: 'transparent',
    color: '#1976d2',
    border: 'none',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  quickActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '2rem',
  },
  actionButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.3s',
  },
  actionButtonHover: {
    backgroundColor: '#1565c0',
  },
  debug: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
};

// Добавляем CSS для hover эффектов
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  .statCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .addButton:hover {
    background-color: #1565c0;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .budgetItem:hover {
    background-color: #f9f9f9;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .transactionItem:hover {
    background-color: #f0f0f0;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .actionButton:hover {
    background-color: #1565c0;
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Dashboard;