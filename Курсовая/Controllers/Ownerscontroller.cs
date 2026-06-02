using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
using Курсовая.Models;

namespace Курсовая.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OwnersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OwnersController(AppDbContext db) => _db = db;
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var owners = await _db.Owners.Include(o => o.Pets).ToListAsync();
            return Ok(owners);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var owner = await _db.Owners.Include(o => o.Pets).FirstOrDefaultAsync(o => o.Id == id);
            return owner is null ? NotFound() : Ok(owner);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Owner owner)
        {
            _db.Owners.Add(owner);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = owner.Id }, owner);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Owner owner)
        {
            if (id != owner.Id) return BadRequest();
            _db.Entry(owner).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Owners.AnyAsync(o => o.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var owner = await _db.Owners.FindAsync(id);
            if (owner is null) return NotFound();
            _db.Owners.Remove(owner);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}