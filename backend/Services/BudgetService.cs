using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    
    public class BudgetService : IBudgetService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITransactionService _transactionService;
        
        public BudgetService(ApplicationDbContext context, ITransactionService transactionService)
        {
            _context = context;
            _transactionService = transactionService;
        }
        
        public async Task<BudgetResponseDto> CreateBudget(int userId, BudgetCreateDto budgetDto)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == budgetDto.CategoryId && c.UserId == userId);
                
            if (category == null)
                throw new Exception("Категория не найдена");
            
            var budget = new Budget
            {
                Name = budgetDto.Name,
                Amount = budgetDto.Amount,
                StartDate = budgetDto.StartDate,
                EndDate = budgetDto.EndDate,
                CategoryId = budgetDto.CategoryId,
                UserId = userId
            };
            
            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();
            
            return await GetBudgetResponse(budget.Id);
        }
        
        public async Task<BudgetResponseDto> GetBudget(int userId, int id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
                
            if (budget == null)
                throw new Exception("Бюджет не найден");
            
            return await MapToDto(budget);
        }
        
        public async Task<IEnumerable<BudgetResponseDto>> GetUserBudgets(int userId)
        {
            var budgets = await _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == userId)
                .OrderBy(b => b.StartDate)
                .ToListAsync();
            
            var result = new List<BudgetResponseDto>();
            foreach (var budget in budgets)
            {
                result.Add(await MapToDto(budget));
            }
            
            return result;
        }
        
        public async Task<BudgetResponseDto> UpdateBudget(int userId, int id, BudgetUpdateDto budgetDto)
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
                
            if (budget == null)
                throw new Exception("Бюджет не найден");
            
            budget.Name = budgetDto.Name;
            budget.Amount = budgetDto.Amount;
            budget.StartDate = budgetDto.StartDate;
            budget.EndDate = budgetDto.EndDate;
            
            await _context.SaveChangesAsync();
            
            return await GetBudgetResponse(id);
        }
        
        public async Task DeleteBudget(int userId, int id)
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
                
            if (budget == null)
                throw new Exception("Бюджет не найден");
            
            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
        }
        
        public async Task<IEnumerable<BudgetResponseDto>> GetCurrentBudgets(int userId)
        {
            var now = DateTime.UtcNow;
            var budgets = await _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.UserId == userId && b.StartDate <= now && b.EndDate >= now)
                .OrderBy(b => b.EndDate)
                .ToListAsync();
            
            var result = new List<BudgetResponseDto>();
            foreach (var budget in budgets)
            {
                result.Add(await MapToDto(budget));
            }
            
            return result;
        }
        
        private async Task<BudgetResponseDto> GetBudgetResponse(int id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);
                
            return await MapToDto(budget!);
        }
        
        private async Task<BudgetResponseDto> MapToDto(Budget budget)
        {
            var spentAmount = await _context.Transactions
                .Where(t => t.UserId == budget.UserId && 
                           t.CategoryId == budget.CategoryId &&
                           t.Date >= budget.StartDate && 
                           t.Date <= budget.EndDate &&
                           t.Type == TransactionType.Expense)
                .SumAsync(t => t.Amount);
            
            return new BudgetResponseDto
            {
                Id = budget.Id,
                Name = budget.Name,
                Amount = budget.Amount,
                StartDate = budget.StartDate,
                EndDate = budget.EndDate,
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                UserId = budget.UserId,
                SpentAmount = spentAmount
            };
        }
    }
}