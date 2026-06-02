using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
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
            var doctors = await _db.Doctors.ToListAsync();
            return Ok(doctors);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doctor = await _db.Doctors
                .Include(d => d.Appointments)
                .FirstOrDefaultAsync(d => d.Id == id);
            return doctor is null ? NotFound() : Ok(doctor);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Doctor doctor)
        {
            _db.Doctors.Add(doctor);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, doctor);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Doctor doctor)
        {
            if (id != doctor.Id) return BadRequest();
            _db.Entry(doctor).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Doctors.AnyAsync(d => d.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var doctor = await _db.Doctors.FindAsync(id);
            if (doctor is null) return NotFound();
            _db.Doctors.Remove(doctor);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}