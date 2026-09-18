namespace InventarioAPI.Models
{
    public class Venta
    {
        public int IdVenta { get; set; }
        public string Vehiculo { get; set; } = string.Empty;
        public string? Placa { get; set; }
        public string? Observaciones { get; set; }
        public string Estado { get; set; } = "Abierta";
        public DateTime FechaApertura { get; set; }
        public DateTime? FechaCierre { get; set; }
        public decimal Total { get; set; }
        public ICollection<DetalleVenta> Detalles { get; set; } = new List<DetalleVenta>();
        public ICollection<MovimientoInventario> Movimientos { get; set; } = new List<MovimientoInventario>();
    }
}
