using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        
        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<CategoryResponseDto> CreateCategory(int userId, CategoryCreateDto categoryDto)
        {
            var category = new Category
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                Type = categoryDto.Type,
                Color = categoryDto.Color,
                Icon = categoryDto.Icon,
                UserId = userId
            };
            
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            
            return MapToDto(category);
        }
        
        public async Task<CategoryResponseDto> GetCategory(int userId, int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
                
            if (category == null)
                throw new Exception("Категория не найдена");
            
            return MapToDto(category);
        }
        
        public async Task<IEnumerable<CategoryResponseDto>> GetUserCategories(int userId)
        {
            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Type)
                .ThenBy(c => c.Name)
                .ToListAsync();
            
            return categories.Select(MapToDto);
        }
        
        public async Task<IEnumerable<CategoryResponseDto>> GetUserCategoriesByType(int userId, CategoryType type)
        {
            var categories = await _context.Categories
                .Where(c => c.UserId == userId && c.Type == type)
                .OrderBy(c => c.Name)
                .ToListAsync();
            
            return categories.Select(MapToDto);
        }
        
        public async Task<CategoryResponseDto> UpdateCategory(int userId, int id, CategoryUpdateDto categoryDto)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
                
            if (category == null)
                throw new Exception("Категория не найдена");
            
            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            category.Color = categoryDto.Color;
            category.Icon = categoryDto.Icon;
            
            await _context.SaveChangesAsync();
            
            return MapToDto(category);
        }
        
        public async Task DeleteCategory(int userId, int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
                
            if (category == null)
                throw new Exception("Категория не найдена");
            
            // Проверяем, есть ли связанные транзакции
            var hasTransactions = await _context.Transactions
                .AnyAsync(t => t.CategoryId == id);
                
            if (hasTransactions)
                throw new Exception("Нельзя удалить категорию, так как с ней связаны транзакции");
            
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
        
        private CategoryResponseDto MapToDto(Category category)
        {
            return new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                Color = category.Color,
                Icon = category.Icon,
                UserId = category.UserId
            };
        }
    }
}