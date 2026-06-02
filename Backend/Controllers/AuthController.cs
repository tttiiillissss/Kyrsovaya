using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
using Курсовая.Helpers;
using Курсовая.Models;

namespace Курсовая.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AuthController(AppDbContext db) => _db = db;
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Пользователь с таким email уже существует.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "client"   // всегда client при публичной регистрации
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.FullName, user.Email, user.Role });
        }

        // Только администратор может создавать пользователей с любой ролью
        [HttpPost("admin/create-user")]
        public async Task<IActionResult> AdminCreateUser([FromBody] RegisterDto dto)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Пользователь с таким email уже существует.");

            var allowedRoles = new[] { "client", "doctor", "admin" };
            var role = (dto.Role ?? "client").ToLower();
            if (!Array.Exists(allowedRoles, r => r == role))
                return BadRequest("Недопустимая роль.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = role
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.FullName, user.Email, user.Role });
        }

        // Только администратор может менять роль
        [HttpPut("admin/change-role/{id}")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleDto dto)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();

            var user = await _db.Users.FindAsync(id);
            if (user is null) return NotFound();

            var allowedRoles = new[] { "client", "doctor", "admin" };
            var role = dto.Role.ToLower();
            if (!Array.Exists(allowedRoles, r => r == role))
                return BadRequest("Недопустимая роль.");

            user.Role = role;
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.FullName, user.Email, user.Role });
        }

        // Список пользователей — только для администратора
        [HttpGet("admin/users")]
        public async Task<IActionResult> GetUsers()
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();

            var users = await _db.Users
                .Select(u => new { u.Id, u.FullName, u.Email, u.Role })
                .ToListAsync();
            return Ok(users);
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Неверный email или пароль.");

            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserRole", user.Role);
            HttpContext.Session.SetString("UserName", user.FullName);
            return Ok(new { user.Id, user.FullName, user.Email, user.Role });
        }
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok("Выход выполнен.");
        }
        [HttpGet("me")]
        public IActionResult Me()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId is null)
                return Unauthorized("Не авторизован.");

            return Ok(new
            {
                Id = userId,
                Name = HttpContext.Session.GetString("UserName"),
                Role = HttpContext.Session.GetString("UserRole")
            });
        }
    }
    public record RegisterDto(string FullName, string Email, string Password, string? Role);
    public record LoginDto(string Email, string Password);
    public record ChangeRoleDto(string Role);
}