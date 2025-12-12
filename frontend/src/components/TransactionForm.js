import React, { useState, useEffect } from 'react';
import TransactionForm from '../components/TransactionForm';
import { transactionsAPI, categoriesAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    type: '',
    minAmount: '',
    maxAmount: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Подготавливаем параметры для фильтрации
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.type) params.type = filters.type;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;

      const response = await transactionsAPI.getAll(params);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      categoryId: '',
      type: '',
      minAmount: '',
      maxAmount: ''
    });
    fetchData();
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      try {
        await transactionsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Ошибка при удалении транзакции');
      }
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchData();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  // Статистика
  const totalIncome = transactions
    .filter(t => t.type === 1)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 2)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (loading && !showForm) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Загрузка транзакций...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Транзакции</h1>
        <button 
          onClick={() => setShowForm(true)}
          style={styles.addButton}
        >
          + Добавить транзакцию
        </button>
      </div>

      {showForm ? (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {/* Фильтры */}
          <div style={styles.filterCard}>
            <h3>Фильтры</h3>
            <div style={styles.filterGrid}>
              <div style={styles.filterGroup}>
                <label>Дата от</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label>Дата до</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label>Категория</label>
                <select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                >
                  <option value="">Все категории</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <label>Тип</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                >
                  <option value="">Все типы</option>
                  <option value="1">Доход</option>
                  <option value="2">Расход</option>
                </select>
              </div>
              
              <div style={styles.filterGroup}>
                <label>Сумма от</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                  placeholder="Минимум"
                />
              </div>
              
              <div style={styles.filterGroup}>
                <label>Сумма до</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  style={styles.filterInput}
                  placeholder="Максимум"
                />
              </div>
            </div>
            
            <div style={styles.filterButtons}>
              <button onClick={applyFilters} style={styles.applyButton}>
                Применить фильтры
              </button>
              <button onClick={clearFilters} style={styles.clearButton}>
                Очистить фильтры
              </button>
            </div>
          </div>

          {/* Статистика */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Доходы</div>
              <div style={styles.statValueIncome}>{formatCurrency(totalIncome)}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Расходы</div>
              <div style={styles.statValueExpense}>{formatCurrency(totalExpense)}</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statLabel}>Баланс</div>
              <div style={{
                ...styles.statValueBalance,
                color: balance >= 0 ? '#2e7d32' : '#c62828'
              }}>
                {formatCurrency(balance)}
              </div>
            </div>
          </div>

          {/* Список транзакций */}
          <div style={styles.tableContainer}>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Транзакции не найдены</p>
                <button 
                  onClick={() => setShowForm(true)}
                  style={styles.emptyButton}
                >
                  Добавить первую транзакцию
                </button>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Описание</th>
                    <th>Категория</th>
                    <th>Тип</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.categoryName}</td>
                      <td>
                        <span style={{
                          ...styles.typeBadge,
                          backgroundColor: transaction.type === 1 ? '#e8f5e9' : '#ffebee',
                          color: transaction.type === 1 ? '#2e7d32' : '#c62828'
                        }}>
                          {transaction.type === 1 ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td style={{
                        fontWeight: 'bold',
                        color: transaction.type === 1 ? '#2e7d32' : '#c62828'
                      }}>
                        {transaction.type === 1 ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        <div style={styles.actionButtons}>
                          <button 
                            onClick={() => handleEdit(transaction)}
                            style={styles.editButton}
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(transaction.id)}
                            style={styles.deleteButton}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  addButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  filterCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  filterInput: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem'
  },
  filterButtons: {
    display: 'flex',
    gap: '1rem'
  },
  applyButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  statItem: {
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem'
  },
  statValueIncome: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  statValueExpense: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#c62828'
  },
  statValueBalance: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'auto'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem'
  },
  emptyButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    marginTop: '1rem',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableTh: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  },
  tableTd: {
    padding: '1rem',
    borderBottom: '1px solid #eee'
  },
  typeBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    backgroundColor: '#e3f2fd',
    border: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    border: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default Transactions;