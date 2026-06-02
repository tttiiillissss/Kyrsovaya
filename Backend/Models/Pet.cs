using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace kyrsovaya.Models
{
    [Table("pets")]
    public class Pet
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("owner_id")]
        public int OwnerId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("animal_type")]
        public string? AnimalType { get; set; }

        [MaxLength(100)]
        [Column("breed")]
        public string? Breed { get; set; }

        [Column("birth_date")]
        public DateOnly? BirthDate { get; set; }

        [ForeignKey("OwnerId")]
        [JsonIgnore]
        public Owner Owner { get; set; } = null!;

        [MaxLength(10)]
        [Column("gender")]
        public string? Gender { get; set; }

        [JsonIgnore]
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}