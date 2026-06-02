using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
using Курсовая.Models;

namespace Курсовая.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PetsController(AppDbContext db) => _db = db;
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pets = await _db.Pets
                .Include(p => p.Owner)
                .ToListAsync();
            return Ok(pets);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pet = await _db.Pets
                .Include(p => p.Owner)
                .Include(p => p.Appointments)
                .FirstOrDefaultAsync(p => p.Id == id);
            return pet is null ? NotFound() : Ok(pet);
        }
        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetByOwner(int ownerId)
        {
            var pets = await _db.Pets.Where(p => p.OwnerId == ownerId).ToListAsync();
            return Ok(pets);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Pet pet)
        {
            _db.Pets.Add(pet);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Pet pet)
        {
            if (id != pet.Id) return BadRequest();
            _db.Entry(pet).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Pets.AnyAsync(p => p.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pet = await _db.Pets.FindAsync(id);
            if (pet is null) return NotFound();
            _db.Pets.Remove(pet);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}