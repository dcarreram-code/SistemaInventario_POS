using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class AgregarDetalleVentaDTO
    {
        [Range(1, int.MaxValue)] public int IdProducto { get; set; }
        [Range(1, int.MaxValue)] public int Cantidad { get; set; }
    }
}
