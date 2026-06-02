using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Курсовая.Data;
using Курсовая.Models;

namespace Курсовая.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AppointmentsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await _db.Appointments
                .Include(a => a.Pet).ThenInclude(p => p.Owner)
                .Include(a => a.Doctor)
                .Include(a => a.Service)
                .ToListAsync();
            return Ok(appointments);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await _db.Appointments
                .Include(a => a.Pet).ThenInclude(p => p.Owner)
                .Include(a => a.Doctor)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == id);
            return appointment is null ? NotFound() : Ok(appointment);
        }
        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctor(int doctorId)
        {
            var list = await _db.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Include(a => a.Pet)
                .Include(a => a.Service)
                .ToListAsync();
            return Ok(list);
        }
        [HttpGet("pet/{petId}")]
        public async Task<IActionResult> GetByPet(int petId)
        {
            var list = await _db.Appointments
                .Where(a => a.PetId == petId)
                .Include(a => a.Doctor)
                .Include(a => a.Service)
                .ToListAsync();
            return Ok(list);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Appointment appointment)
        {
            _db.Appointments.Add(appointment);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Appointment appointment)
        {
            if (id != appointment.Id) return BadRequest();
            _db.Entry(appointment).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _db.Appointments.AnyAsync(a => a.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment is null) return NotFound();
            appointment.Status = status;
            await _db.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment is null) return NotFound();
            _db.Appointments.Remove(appointment);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}