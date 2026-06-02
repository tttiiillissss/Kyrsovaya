using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using kyrsovaya.Data;
using kyrsovaya.Helpers;
using kyrsovaya.Models;

namespace kyrsovaya.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ServicesController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var services = await _db.Services.ToListAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var service = await _db.Services.FindAsync(id);
            return service is null ? NotFound() : Ok(service);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Service service)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            _db.Services.Add(service);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Service service)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            if (id != service.Id) return BadRequest();
            _db.Entry(service).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_db.Services.Any(s => s.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            var service = await _db.Services.FindAsync(id);
            if (service is null) return NotFound();
            _db.Services.Remove(service);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
