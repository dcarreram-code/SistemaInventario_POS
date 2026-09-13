using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace InventarioAPI.DTOs
{
    public class CrearProductoDTO
    {
        [Required(ErrorMessage = "El código de barras es obligatorio.")]
        [RegularExpression(
            @"^\d{8,14}$",
            ErrorMessage = "El código de barras debe contener entre 8 y 14 números."
        )]
        public string CodigoBarras { get; set; } = string.Empty;


        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(
            150,
            MinimumLength = 2,
            ErrorMessage = "El nombre debe tener entre 2 y 150 caracteres."
        )]
        public string Nombre { get; set; } = string.Empty;


        [Range(
            1,
            int.MaxValue,
            ErrorMessage = "Debe seleccionar una categoría válida."
        )]
        public int IdCategoria { get; set; }


        [Range(
            0,
            double.MaxValue,
            ErrorMessage = "El precio de compra no puede ser negativo."
        )]
        public decimal PrecioCompra { get; set; }


        [Range(
            0,
            double.MaxValue,
            ErrorMessage = "El precio de venta no puede ser negativo."
        )]
        public decimal PrecioVenta { get; set; }


        [StringLength(
            500,
            ErrorMessage = "La descripción no puede superar los 500 caracteres."
        )]
        public string? Descripcion { get; set; }


        public IFormFile? Imagen { get; set; }


        [Range(
            0,
            int.MaxValue,
            ErrorMessage = "El stock no puede ser negativo."
        )]
        public int Stock { get; set; }
    }
}