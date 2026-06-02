using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using kyrsovaya.Data;
using kyrsovaya.Helpers;
using kyrsovaya.Models;

namespace kyrsovaya.Controllers
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
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

            // Клиент видит только своих питомцев
            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var owner = await _db.Owners.FirstOrDefaultAsync(o => o.UserId == userId);
                if (owner == null) return Ok(new List<object>());

                var myPets = await _db.Pets
                    .Include(p => p.Owner)
                    .Where(p => p.OwnerId == owner.Id)
                    .ToListAsync();
                return Ok(myPets);
            }

            // Врач и администратор видят всех питомцев
            var pets = await _db.Pets.Include(p => p.Owner).ToListAsync();
            return Ok(pets);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var pet = await _db.Pets.Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == id);
            return pet is null ? NotFound() : Ok(pet);
        }

        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetByOwner(int ownerId)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var list = await _db.Pets.Where(p => p.OwnerId == ownerId).ToListAsync();
            return Ok(list);
        }

        // Администратор и клиент могут добавлять питомца.
        // Клиент может добавить питомца только себе (OwnerId должен совпадать с его профилем).
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Pet pet)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var owner = await _db.Owners.FirstOrDefaultAsync(o => o.UserId == userId);
                if (owner == null)
                    return Forbid(); // у клиента ещё нет профиля владельца
                if (pet.OwnerId != owner.Id)
                    return Forbid(); // нельзя добавить питомца другому владельцу
            }
            else if (!AuthHelper.IsAdmin(HttpContext))
            {
                return Forbid(); // врач не может добавлять питомцев
            }

            _db.Pets.Add(pet);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = pet.Id }, pet);
        }

        // Администратор может редактировать любого питомца.
        // Клиент может редактировать только своих питомцев.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Pet pet)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var owner = await _db.Owners.FirstOrDefaultAsync(o => o.UserId == userId);
                if (owner == null || pet.OwnerId != owner.Id)
                    return Forbid();
                // Дополнительно проверяем, что редактируемый питомец действительно принадлежит этому клиенту
                var existing = await _db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
                if (existing == null || existing.OwnerId != owner.Id)
                    return Forbid();
            }
            else if (!AuthHelper.IsAdmin(HttpContext))
            {
                return Forbid(); // врач не может редактировать питомцев
            }

            if (id != pet.Id) return BadRequest();
            _db.Entry(pet).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_db.Pets.Any(p => p.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        // Удалять питомцев может только администратор
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            var pet = await _db.Pets.FindAsync(id);
            if (pet is null) return NotFound();
            _db.Pets.Remove(pet);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
