namespace InventarioAPI.Models
{
    public class MovimientoInventario
    {
        public int IdMovimientoInventario { get; set; }
        public int IdProducto { get; set; }
        public int? IdVenta { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public int StockAnterior { get; set; }
        public int StockPosterior { get; set; }
        public DateTime Fecha { get; set; }
        public string? Descripcion { get; set; }
        public Producto? Producto { get; set; }
        public Venta? Venta { get; set; }
    }
}
