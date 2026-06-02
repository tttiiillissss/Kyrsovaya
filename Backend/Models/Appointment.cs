using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace kyrsovaya.Models
{
    [Table("appointments")]
    public class Appointment
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("appointment_datetime")]
        public DateTime AppointmentDatetime { get; set; }

        [Required]
        [Column("pet_id")]
        public int PetId { get; set; }

        [Required]
        [Column("doctor_id")]
        public int DoctorId { get; set; }

        [Required]
        [Column("service_id")]
        public int ServiceId { get; set; }

        [MaxLength(20)]
        [Column("status")]
        public string? Status { get; set; }

        [MaxLength(500)]
        [Column("notes")]
        public string? Notes { get; set; }

        [ForeignKey("PetId")]
        public Pet Pet { get; set; } = null!;

        [ForeignKey("DoctorId")]
        public Doctor Doctor { get; set; } = null!;

        [ForeignKey("ServiceId")]
        public Service Service { get; set; } = null!;
    }
}