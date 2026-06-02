using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using kyrsovaya.Controllers;

namespace kyrsovaya.Models
{
    [Table("services")]
    public class Service
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("price", TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Column("duration_minutes")]
        public int DurationMinutes { get; set; }

        [JsonIgnore]
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
