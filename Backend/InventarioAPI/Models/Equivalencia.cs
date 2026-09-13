namespace InventarioAPI.Models
{
    public class Equivalencia
    {
        public int IdEquivalencia { get; set; }

        public int IdProducto { get; set; }

        public string Marca { get; set; } = string.Empty;

        public string Codigo { get; set; } = string.Empty;

        public Producto? Producto { get; set; }
    }
}