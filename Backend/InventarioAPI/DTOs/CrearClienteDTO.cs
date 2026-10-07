using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class CrearClienteDTO
    {
        [Required, StringLength(150, MinimumLength = 2)]
        public string Nombre { get; set; } = string.Empty;

        [Required, StringLength(20, MinimumLength = 7)]
        public string Telefono { get; set; } = string.Empty;

        [StringLength(30)]
        public string? DpiNit { get; set; }

        [StringLength(250)]
        public string? Direccion { get; set; }
    }
}
