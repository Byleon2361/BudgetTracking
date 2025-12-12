namespace Backend.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public CategoryType Type { get; set; }
        public string Color { get; set; } = "#000000";
        public string Icon { get; set; } = string.Empty;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    }
}

namespace Backend.Models
{
    public enum CategoryType
    {
        Income = 1,
        Expense = 2
    }
}