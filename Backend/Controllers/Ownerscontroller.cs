using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using kyrsovaya.Data;
using kyrsovaya.Helpers;
using kyrsovaya.Models;

namespace kyrsovaya.Controllers
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
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var myOwner = await _db.Owners
                    .Include(o => o.Pets)
                    .Where(o => o.UserId == userId)
                    .ToListAsync();
                return Ok(myOwner);
            }

            var owners = await _db.Owners.Include(o => o.Pets).ToListAsync();
            return Ok(owners);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var owner = await _db.Owners.Include(o => o.Pets).FirstOrDefaultAsync(o => o.Id == id);
            return owner is null ? NotFound() : Ok(owner);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Owner owner)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            _db.Owners.Add(owner);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = owner.Id }, owner);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Owner owner)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            if (id != owner.Id) return BadRequest();
            _db.Entry(owner).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_db.Owners.Any(o => o.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            var owner = await _db.Owners.FindAsync(id);
            if (owner is null) return NotFound();
            _db.Owners.Remove(owner);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
