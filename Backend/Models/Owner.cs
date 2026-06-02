using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Курсовая.Models
{
    [Table("owners")]
    public class Owner
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("fullname")]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("phone")]
        public string? Phone { get; set; }

        [MaxLength(100)]
        [Column("email")]
        public string? Email { get; set; }

        [MaxLength(200)]
        [Column("address")]
        public string? Address { get; set; }

        [JsonIgnore]
        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}