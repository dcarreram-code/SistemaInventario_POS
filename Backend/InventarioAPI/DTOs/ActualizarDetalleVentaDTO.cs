using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class ActualizarDetalleVentaDTO
    {
        [Range(1, int.MaxValue)] public int Cantidad { get; set; }
    }
}
