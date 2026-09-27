namespace InventarioAPI.Models
{
    public class PagoVenta
    {
        public int IdPagoVenta { get; set; }
        public int IdVenta { get; set; }
        public decimal Monto { get; set; }
        public DateTime FechaPago { get; set; }
        public Venta? Venta { get; set; }
    }
}
