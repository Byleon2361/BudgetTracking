using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    public interface IBudgetService
    {
        Task<BudgetResponseDto> CreateBudget(int userId, BudgetCreateDto budgetDto);
        Task<BudgetResponseDto> GetBudget(int userId, int id);
        Task<IEnumerable<BudgetResponseDto>> GetUserBudgets(int userId);
        Task<BudgetResponseDto> UpdateBudget(int userId, int id, BudgetUpdateDto budgetDto);
        Task DeleteBudget(int userId, int id);
        Task<IEnumerable<BudgetResponseDto>> GetCurrentBudgets(int userId);
    }
}