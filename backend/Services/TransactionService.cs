using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    
    public class CategorySummaryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public CategoryType Type { get; set; }
    }
    
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;
        
        public TransactionService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<TransactionResponseDto> CreateTransaction(int userId, TransactionCreateDto transactionDto)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == transactionDto.CategoryId && c.UserId == userId);
                
            if (category == null)
                throw new Exception("Категория не найдена");
            
            var transaction = new Transaction
            {
                Amount = transactionDto.Amount,
                Description = transactionDto.Description,
                Date = transactionDto.Date,
                Type = transactionDto.Type,
                CategoryId = transactionDto.CategoryId,
                UserId = userId
            };
            
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            
            return await GetTransactionResponse(transaction.Id);
        }
        
        public async Task<TransactionResponseDto> GetTransaction(int userId, int id)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
            if (transaction == null)
                throw new Exception("Транзакция не найдена");
            
            return MapToDto(transaction);
        }
        
        public async Task<IEnumerable<TransactionResponseDto>> GetUserTransactions(
            int userId, TransactionFilterDto filter)
        {
            var query = _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId);
            
            if (filter.StartDate.HasValue)
                query = query.Where(t => t.Date >= filter.StartDate.Value);
                
            if (filter.EndDate.HasValue)
                query = query.Where(t => t.Date <= filter.EndDate.Value);
                
            if (filter.CategoryId.HasValue)
                query = query.Where(t => t.CategoryId == filter.CategoryId.Value);
                
            if (filter.Type.HasValue)
                query = query.Where(t => t.Type == filter.Type.Value);
                
            if (filter.MinAmount.HasValue)
                query = query.Where(t => t.Amount >= filter.MinAmount.Value);
                
            if (filter.MaxAmount.HasValue)
                query = query.Where(t => t.Amount <= filter.MaxAmount.Value);
            
            var transactions = await query
                .OrderByDescending(t => t.Date)
                .ToListAsync();
            
            return transactions.Select(MapToDto);
        }
        
        public async Task<TransactionResponseDto> UpdateTransaction(
            int userId, int id, TransactionUpdateDto transactionDto)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
            if (transaction == null)
                throw new Exception("Транзакция не найдена");
            
            transaction.Amount = transactionDto.Amount;
            transaction.Description = transactionDto.Description;
            transaction.Date = transactionDto.Date;
            transaction.CategoryId = transactionDto.CategoryId;
            
            await _context.SaveChangesAsync();
            
            return await GetTransactionResponse(id);
        }
        
        public async Task DeleteTransaction(int userId, int id)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
                
            if (transaction == null)
                throw new Exception("Транзакция не найдена");
            
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }
        
        public async Task<decimal> GetBalance(int userId)
        {
            var income = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == TransactionType.Income)
                .SumAsync(t => t.Amount);
                
            var expense = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == TransactionType.Expense)
                .SumAsync(t => t.Amount);
            
            return income - expense;
        }
        
        public async Task<IEnumerable<CategorySummaryDto>> GetCategorySummary(
            int userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId && t.Date >= startDate && t.Date <= endDate)
                .GroupBy(t => new { t.CategoryId, t.Category.Name, t.Category.Type })
                .Select(g => new CategorySummaryDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    Type = g.Key.Type,
                    TotalAmount = g.Sum(t => t.Amount)
                })
                .ToListAsync();
        }
        
        private async Task<TransactionResponseDto> GetTransactionResponse(int id)
        {
            var transaction = await _context.Transactions
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id);
                
            return MapToDto(transaction!);
        }
        
        private TransactionResponseDto MapToDto(Transaction transaction)
        {
            return new TransactionResponseDto
            {
                Id = transaction.Id,
                Amount = transaction.Amount,
                Description = transaction.Description,
                Date = transaction.Date,
                Type = transaction.Type,
                CategoryId = transaction.CategoryId,
                CategoryName = transaction.Category.Name,
                UserId = transaction.UserId
            };
        }
    }
}