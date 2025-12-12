namespace Backend.DTOs
{
    public class BudgetCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CategoryId { get; set; }
    }
    
    public class BudgetUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
    
    public class BudgetResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount => Amount - SpentAmount;
        public decimal Percentage => Amount > 0 ? (SpentAmount / Amount) * 100 : 0;
    }
}