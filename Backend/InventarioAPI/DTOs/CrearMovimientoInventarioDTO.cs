using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class CrearMovimientoInventarioDTO
    {
        [Range(1, int.MaxValue)]
        public int IdProducto { get; set; }

        [Required]
        public string Tipo { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Cantidad { get; set; }

        public string? DireccionAjuste { get; set; }

        [Required]
        [StringLength(250)]
        public string Descripcion { get; set; } = string.Empty;
    }
}
