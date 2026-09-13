namespace InventarioAPI.DTOs
{
    public class ProductoDTO
    {
        public int IdProducto { get; set; }

        public string CodigoBarras { get; set; } = string.Empty;

        public string Nombre { get; set; } = string.Empty;

        public int IdCategoria { get; set; }

        public string Categoria { get; set; } = string.Empty;

        public decimal PrecioCompra { get; set; }

        public decimal PrecioVenta { get; set; }

        public string? Descripcion { get; set; }

        public string? Imagen { get; set; }

        public int Stock { get; set; }

        public string? Bodega { get; set; }

        public string? Estanteria { get; set; }

        public string? Fila { get; set; }

        public DateTime FechaRegistro { get; set; }

        public bool Estado { get; set; }
    }
}
