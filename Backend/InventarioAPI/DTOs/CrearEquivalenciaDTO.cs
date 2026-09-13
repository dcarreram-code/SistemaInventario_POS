namespace InventarioAPI.DTOs
{
    public class CrearEquivalenciaDTO
    {
        public int IdProducto { get; set; }

        public string Marca { get; set; } = string.Empty;

        public string Codigo { get; set; } = string.Empty;
    }
}