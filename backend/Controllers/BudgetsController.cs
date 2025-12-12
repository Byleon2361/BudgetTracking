using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.Services;
using Backend.DTOs;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetsController : ControllerBase
    {
        private readonly IBudgetService _budgetService;
        
        public BudgetsController(IBudgetService budgetService)
        {
            _budgetService = budgetService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BudgetResponseDto>>> GetBudgets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var budgets = await _budgetService.GetUserBudgets(userId);
            return Ok(budgets);
        }
        
        [HttpGet("current")]
        public async Task<ActionResult<IEnumerable<BudgetResponseDto>>> GetCurrentBudgets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var budgets = await _budgetService.GetCurrentBudgets(userId);
            return Ok(budgets);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<BudgetResponseDto>> GetBudget(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var budget = await _budgetService.GetBudget(userId, id);
                return Ok(budget);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        
        [HttpPost]
        public async Task<ActionResult<BudgetResponseDto>> CreateBudget(BudgetCreateDto budgetDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var budget = await _budgetService.CreateBudget(userId, budgetDto);
                return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPut("{id}")]
        public async Task<ActionResult<BudgetResponseDto>> UpdateBudget(int id, BudgetUpdateDto budgetDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var budget = await _budgetService.UpdateBudget(userId, id, budgetDto);
                return Ok(budget);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                await _budgetService.DeleteBudget(userId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}