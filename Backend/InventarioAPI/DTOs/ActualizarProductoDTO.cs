using Microsoft.AspNetCore.Http;

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

        public bool Estado { get; set; }
    }
}