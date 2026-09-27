using System.ComponentModel.DataAnnotations;

namespace InventarioAPI.DTOs
{
    public class RegistrarPagoVentaDTO
    {
        [Range(typeof(decimal), "0.01", "9999999999.99")]
        public decimal Monto { get; set; }
    }
}
