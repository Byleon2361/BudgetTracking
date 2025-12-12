 using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        
        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        
public async Task<UserResponseDto> Register(UserRegisterDto request)
{
    Console.WriteLine($"Register: Username={request.Username}, Email={request.Email}");
    
    if (await _context.Users.AnyAsync(u => u.Username == request.Username))
        throw new Exception("Пользователь с таким именем уже существует");
        
    if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        throw new Exception("Пользователь с таким email уже существует");
    
    // Проверьте что пароль не null
    if (string.IsNullOrEmpty(request.Password))
        throw new Exception("Password is required");
    
    CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);
    
    // Проверьте что хэш и соль создались
    if (passwordHash == null || passwordHash.Length == 0)
        throw new Exception("Failed to create password hash");
    
    if (passwordSalt == null || passwordSalt.Length == 0)
        throw new Exception("Failed to create password salt");
    
    var user = new User
    {
        Username = request.Username,
        Email = request.Email,
        PasswordHash = passwordHash,
        PasswordSalt = passwordSalt,
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    
    Console.WriteLine($"User {user.Username} registered successfully. ID: {user.Id}");
    
    return new UserResponseDto
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        CreatedAt = user.CreatedAt
    };
}
        
public async Task<string> Login(UserLoginDto request)
{
    // Проверьте что request не null
    if (request == null)
        throw new Exception("Request is null");
    
    // Проверьте что Username не null/empty
    if (string.IsNullOrEmpty(request.Username))
        throw new Exception("Username is required");
    
    if (string.IsNullOrEmpty(request.Password))
        throw new Exception("Password is required");
    
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
    
    if (user == null)
        throw new Exception("Неверное имя пользователя или пароль");
    
    // Проверьте что PasswordHash и PasswordSalt не null/empty
    if (user.PasswordHash == null || user.PasswordHash.Length == 0)
        throw new Exception("Invalid password hash");
        
    if (user.PasswordSalt == null || user.PasswordSalt.Length == 0)
        throw new Exception("Invalid password salt");
    
    if (!VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
        throw new Exception("Неверное имя пользователя или пароль");
    
    return GenerateToken(user);
}
    public string GenerateToken(User user)
{
    if (user == null)
        throw new ArgumentNullException(nameof(user));
    
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username ?? ""),
        new Claim(ClaimTypes.Email, user.Email ?? "")
    };
    
    // Тот же ключ что и в Program.cs!
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
        "this-is-a-very-long-secret-key-for-hmac-sha512-that-must-be-at-least-64-characters-long-1234567890!"));
    
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
    
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.Now.AddDays(7),
        SigningCredentials = creds
    };
    
    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);
    
    return tokenHandler.WriteToken(token);
}
        public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
        
        public bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512(passwordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(passwordHash);
        }
    }
}