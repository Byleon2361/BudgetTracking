using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.Models;
using Backend.Services;
using Backend.DTOs;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        
        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionResponseDto>>> GetTransactions(
            [FromQuery] TransactionFilterDto filter)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var transactions = await _transactionService.GetUserTransactions(userId, filter);
            return Ok(transactions);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionResponseDto>> GetTransaction(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var transaction = await _transactionService.GetTransaction(userId, id);
                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
        
        [HttpPost]
        public async Task<ActionResult<TransactionResponseDto>> CreateTransaction(TransactionCreateDto transactionDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var transaction = await _transactionService.CreateTransaction(userId, transactionDto);
                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPut("{id}")]
        public async Task<ActionResult<TransactionResponseDto>> UpdateTransaction(
            int id, TransactionUpdateDto transactionDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var transaction = await _transactionService.UpdateTransaction(userId, id, transactionDto);
                return Ok(transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                await _transactionService.DeleteTransaction(userId, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpGet("balance")]
        public async Task<ActionResult<decimal>> GetBalance()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var balance = await _transactionService.GetBalance(userId);
            return Ok(balance);
        }
        
        [HttpGet("summary")]
        public async Task<ActionResult<IEnumerable<CategorySummaryDto>>> GetCategorySummary(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var summary = await _transactionService.GetCategorySummary(userId, startDate, endDate);
            return Ok(summary);
        }
    }
}