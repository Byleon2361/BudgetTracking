using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    public interface ITransactionService
    {
        Task<TransactionResponseDto> CreateTransaction(int userId, TransactionCreateDto transactionDto);
        Task<TransactionResponseDto> GetTransaction(int userId, int id);
        Task<IEnumerable<TransactionResponseDto>> GetUserTransactions(int userId, TransactionFilterDto filter);
        Task<TransactionResponseDto> UpdateTransaction(int userId, int id, TransactionUpdateDto transactionDto);
        Task DeleteTransaction(int userId, int id);
        Task<decimal> GetBalance(int userId);
        Task<IEnumerable<CategorySummaryDto>> GetCategorySummary(int userId, DateTime startDate, DateTime endDate);
    }
}