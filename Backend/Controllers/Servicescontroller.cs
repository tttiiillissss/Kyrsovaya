using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
using Курсовая.Models;

namespace Курсовая.Controllers
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
            var services = await _db.Services.ToListAsync();
            return Ok(services);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var service = await _db.Services.FindAsync(id);
            return service is null ? NotFound() : Ok(service);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Service service)
        {
            _db.Services.Add(service);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Service service)
        {
            if (id != service.Id) return BadRequest();
            _db.Entry(service).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Services.AnyAsync(s => s.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var service = await _db.Services.FindAsync(id);
            if (service is null) return NotFound();
            _db.Services.Remove(service);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}