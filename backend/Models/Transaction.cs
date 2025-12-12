namespace Backend.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public TransactionType Type { get; set; }
        
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}

namespace Backend.Models
{
    public enum TransactionType
    {
        Income = 1,
        Expense = 2
    }
}