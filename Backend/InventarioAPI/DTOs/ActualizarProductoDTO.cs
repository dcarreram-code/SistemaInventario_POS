using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class ActualizarProductoDTO
    {
        public string CodigoBarras { get; set; } = string.Empty;

        public string Nombre { get; set; } = string.Empty;

        public int IdCategoria { get; set; }

        public decimal PrecioCompra { get; set; }

        public decimal PrecioVenta { get; set; }

        public string? Descripcion { get; set; }

        public IFormFile? Imagen { get; set; }

        public int Stock { get; set; }

        [StringLength(50)]
        public string? Bodega { get; set; }

        [StringLength(50)]
        public string? Estanteria { get; set; }

        [StringLength(50)]
        public string? Fila { get; set; }

        public bool Estado { get; set; }
    }
}
