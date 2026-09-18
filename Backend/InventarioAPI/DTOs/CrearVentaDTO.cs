using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class CrearVentaDTO
    {
        [Required, StringLength(100)]
        public string Vehiculo { get; set; } = string.Empty;
        [StringLength(20)] public string? Placa { get; set; }
        [StringLength(500)] public string? Observaciones { get; set; }
    }
}
