using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
using Курсовая.Helpers;
using Курсовая.Models;

namespace Курсовая.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DoctorsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var doctors = await _db.Doctors.ToListAsync();
            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            var doctor = await _db.Doctors.FindAsync(id);
            return doctor is null ? NotFound() : Ok(doctor);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Doctor doctor)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            _db.Doctors.Add(doctor);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, doctor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Doctor doctor)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            if (id != doctor.Id) return BadRequest();
            _db.Entry(doctor).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_db.Doctors.Any(d => d.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();
            var doctor = await _db.Doctors.FindAsync(id);
            if (doctor is null) return NotFound();
            _db.Doctors.Remove(doctor);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}