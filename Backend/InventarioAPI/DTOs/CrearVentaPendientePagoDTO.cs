using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class CrearVentaPendientePagoDTO
    {
        public int? IdCliente { get; set; }

        [Required, StringLength(150, MinimumLength = 3)]
        public string NombreCliente { get; set; } = string.Empty;

        [Required, StringLength(20, MinimumLength = 7)]
        public string TelefonoCliente { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Vehiculo { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string Placa { get; set; } = string.Empty;
    }
}
