using System.Data;
using InventarioAPI.Data;
using InventarioAPI.DTOs;
using InventarioAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovimientosController : ControllerBase
    {
        private static readonly string[] TiposMovimiento =
        {
            "Entrada",
            "Ajuste",
            "Salida",
            "Devolucion"
        };

        private readonly InventarioDbContext _context;

        public MovimientosController(InventarioDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> Obtener(
            [FromQuery] int? idProducto,
            [FromQuery] string? tipo,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
            if (desde.HasValue && hasta.HasValue && hasta.Value.Date < desde.Value.Date)
                return BadRequest(new { mensaje = "La fecha final no puede ser anterior a la inicial." });

            var consulta = _context.MovimientosInventario.AsQueryable();

            if (idProducto.HasValue)
                consulta = consulta.Where(m => m.IdProducto == idProducto.Value);

            if (!string.IsNullOrWhiteSpace(tipo))
                consulta = consulta.Where(m => m.Tipo == tipo.Trim());

            if (desde.HasValue)
                consulta = consulta.Where(m => m.Fecha >= desde.Value.Date);

            if (hasta.HasValue)
                consulta = consulta.Where(m => m.Fecha < hasta.Value.Date.AddDays(1));

            var movimientos = await consulta
                .OrderByDescending(m => m.Fecha)
                .ThenByDescending(m => m.IdMovimientoInventario)
                .Select(m => new
                {
                    m.IdMovimientoInventario,
                    m.IdProducto,
                    Producto = m.Producto == null ? "" : m.Producto.Nombre,
                    m.IdVenta,
                    m.Tipo,
                    m.Cantidad,
                    m.StockAnterior,
                    m.StockPosterior,
                    m.Fecha,
                    m.Descripcion
                })
                .ToListAsync();

            return Ok(movimientos);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(CrearMovimientoInventarioDTO dto)
        {
            var tipo = dto.Tipo.Trim();
            if (!TiposMovimiento.Contains(tipo, StringComparer.OrdinalIgnoreCase))
                return BadRequest(new { mensaje = "El tipo de movimiento no es válido." });

            tipo = TiposMovimiento.First(t => t.Equals(tipo, StringComparison.OrdinalIgnoreCase));

            if (string.IsNullOrWhiteSpace(dto.Descripcion))
                return BadRequest(new { mensaje = "La descripción o motivo es obligatorio." });

            var direccion = dto.DireccionAjuste?.Trim();
            if (tipo == "Ajuste" &&
                direccion is not ("Incrementar" or "Disminuir"))
                return BadRequest(new { mensaje = "Seleccione si el ajuste incrementa o disminuye el stock." });

            if (tipo != "Ajuste" && !string.IsNullOrWhiteSpace(direccion))
                return BadRequest(new { mensaje = "La dirección solo se utiliza para los ajustes." });

            await using var transaccion = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.IdProducto == dto.IdProducto && p.Estado);

            if (producto == null)
                return NotFound(new { mensaje = "Producto activo no encontrado." });

            var cantidad = tipo == "Salida" || (tipo == "Ajuste" && direccion == "Disminuir")
                ? -dto.Cantidad
                : dto.Cantidad;
            var nuevoStock = (long)producto.Stock + cantidad;

            if (nuevoStock < 0)
                return BadRequest(new { mensaje = "La operación no puede dejar el stock en negativo." });

            if (nuevoStock > int.MaxValue)
                return BadRequest(new { mensaje = "El stock resultante supera el máximo permitido." });

            var stockAnterior = producto.Stock;
            producto.Stock = (int)nuevoStock;

            var movimiento = new MovimientoInventario
            {
                IdProducto = producto.IdProducto,
                Tipo = tipo,
                Cantidad = cantidad,
                StockAnterior = stockAnterior,
                StockPosterior = producto.Stock,
                Fecha = DateTime.Now,
                Descripcion = dto.Descripcion.Trim()
            };

            _context.MovimientosInventario.Add(movimiento);
            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            return CreatedAtAction(nameof(Obtener), new { idProducto = producto.IdProducto }, new
            {
                movimiento.IdMovimientoInventario,
                movimiento.IdProducto,
                movimiento.Tipo,
                movimiento.Cantidad,
                movimiento.StockAnterior,
                movimiento.StockPosterior,
                movimiento.Fecha,
                movimiento.Descripcion
            });
        }
    }
}
