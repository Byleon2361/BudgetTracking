using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    public interface ICategoryService
    {
        Task<CategoryResponseDto> CreateCategory(int userId, CategoryCreateDto categoryDto);
        Task<CategoryResponseDto> GetCategory(int userId, int id);
        Task<IEnumerable<CategoryResponseDto>> GetUserCategories(int userId);
        Task<IEnumerable<CategoryResponseDto>> GetUserCategoriesByType(int userId, CategoryType type);
        Task<CategoryResponseDto> UpdateCategory(int userId, int id, CategoryUpdateDto categoryDto);
        Task DeleteCategory(int userId, int id);
    }
}