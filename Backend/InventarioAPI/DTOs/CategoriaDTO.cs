namespace InventarioAPI.DTOs
{
    public class CategoriaDTO
    {
        public int IdCategoria { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }
    }
}