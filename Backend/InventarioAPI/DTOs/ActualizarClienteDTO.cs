using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class ActualizarClienteDTO : CrearClienteDTO
    {
        public bool Activo { get; set; } = true;
    }
}
