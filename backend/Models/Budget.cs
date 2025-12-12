namespace Backend.Models
{
    public class Budget
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        // Внешние ключи
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}