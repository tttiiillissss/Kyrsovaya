using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using kyrsovaya.Data;
using kyrsovaya.Helpers;
using kyrsovaya.Models;

namespace kyrsovaya.Controllers
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
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

            // Клиент видит только приёмы своих питомцев
            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var owner = await _db.Owners.FirstOrDefaultAsync(o => o.UserId == userId);
                if (owner == null) return Ok(new List<object>());

                var clientAppts = await _db.Appointments
                    .Include(a => a.Pet).ThenInclude(p => p.Owner)
                    .Include(a => a.Doctor)
                    .Include(a => a.Service)
                    .Where(a => a.Pet.OwnerId == owner.Id)
                    .ToListAsync();
                return Ok(clientAppts);
            }

            // Врач видит только свои приёмы
            if (AuthHelper.GetRole(HttpContext) == "doctor")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var doctor = await _db.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
                if (doctor == null) return Ok(new List<object>());

                var doctorAppts = await _db.Appointments
                    .Include(a => a.Pet).ThenInclude(p => p.Owner)
                    .Include(a => a.Doctor)
                    .Include(a => a.Service)
                    .Where(a => a.DoctorId == doctor.Id)
                    .ToListAsync();
                return Ok(doctorAppts);
            }

            // Администратор видит всё
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
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

            var appointment = await _db.Appointments
                .Include(a => a.Pet).ThenInclude(p => p.Owner)
                .Include(a => a.Doctor)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (appointment is null) return NotFound();
            // Клиент видит только свои приёмы
            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var owner = await _db.Owners.FirstOrDefaultAsync(o => o.UserId == userId);
                if (owner == null || appointment.Pet?.OwnerId != owner.Id)
                    return Forbid();
            }
            return Ok(appointment);
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctor(int doctorId)
        {
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

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
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");

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
            if (!AuthHelper.IsAuthenticated(HttpContext))
                return Unauthorized("Необходима авторизация.");
            // Клиент может создавать запись только для своего питомца
            if (AuthHelper.GetRole(HttpContext) == "client")
            {
                var userId = AuthHelper.GetUserId(HttpContext);
                var owner = await _db.Owners.FirstOrDefaultAsync(o => o.UserId == userId);
                if (owner == null) return Forbid();
                var pet = await _db.Pets.FindAsync(appointment.PetId);
                if (pet == null || pet.OwnerId != owner.Id)
                    return Forbid();
            }

            _db.Appointments.Add(appointment);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Appointment appointment)
        {
            if (!AuthHelper.IsAdminOrDoctor(HttpContext))
                return Forbid();

            if (id != appointment.Id) return BadRequest();
            _db.Entry(appointment).State = EntityState.Modified;
            try { await _db.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_db.Appointments.Any(a => a.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!AuthHelper.IsAdmin(HttpContext))
                return Forbid();

            var appointment = await _db.Appointments.FindAsync(id);
            if (appointment is null) return NotFound();
            _db.Appointments.Remove(appointment);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}