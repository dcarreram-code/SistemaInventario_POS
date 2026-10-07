using InventarioAPI.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly InventarioDbContext _context;

        public DashboardController(InventarioDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> ObtenerResumen()
        {
            var inicioDia = DateTime.Today;
            var finDia = inicioDia.AddDays(1);

            var productosActivos = _context.Productos.Where(p => p.Estado);
            var ventasPendientes = _context.Ventas.Where(v => v.Estado == "PendientePago");

            var resumen = new
            {
                ProductosActivos = await productosActivos.CountAsync(),
                VentasHoy = await _context.Ventas.CountAsync(v =>
                    v.Estado == "Completada" &&
                    v.FechaCierre >= inicioDia &&
                    v.FechaCierre < finDia),
                IngresosHoy = await _context.PagosVenta
                    .Where(p => p.Fecha >= inicioDia && p.Fecha < finDia)
                    .SumAsync(p => (decimal?)p.Monto) ?? 0,
                ProductosStockBajo = await productosActivos.CountAsync(p => p.Stock <= p.StockMinimo),
                CategoriasActivas = await _context.Categorias.CountAsync(c => c.Estado),
                VentasAbiertas = await _context.Ventas.CountAsync(v => v.Estado == "Abierta"),
                VentasPendientes = await ventasPendientes.CountAsync(),
                SaldoPendiente = await ventasPendientes
                    .Select(v => v.Total - (v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0))
                    .SumAsync(saldo => (decimal?)saldo) ?? 0
            };

            var productosStockBajo = await productosActivos
                .Where(p => p.Stock <= p.StockMinimo)
                .OrderBy(p => p.Stock)
                .ThenBy(p => p.Nombre)
                .Select(p => new
                {
                    p.IdProducto,
                    p.Nombre,
                    p.CodigoBarras,
                    p.Stock,
                    p.StockMinimo
                })
                .ToListAsync();

            var productosMasVendidos = await _context.DetallesVenta
                .Where(d => d.Venta != null &&
                    (d.Venta.Estado == "Completada" || d.Venta.Estado == "PendientePago"))
                .GroupBy(d => new { d.IdProducto, d.NombreProducto })
                .Select(grupo => new
                {
                    grupo.Key.IdProducto,
                    Nombre = grupo.Key.NombreProducto,
                    CantidadVendida = grupo.Sum(d => d.Cantidad)
                })
                .OrderByDescending(producto => producto.CantidadVendida)
                .ThenBy(producto => producto.Nombre)
                .Take(5)
                .ToListAsync();

            var ultimasVentas = await _context.Ventas
                .OrderByDescending(v => v.FechaCierre ?? v.FechaApertura)
                .ThenByDescending(v => v.IdVenta)
                .Take(8)
                .Select(v => new
                {
                    v.IdVenta,
                    v.Vehiculo,
                    v.Placa,
                    v.Estado,
                    Fecha = v.FechaCierre ?? v.FechaApertura,
                    CantidadProductos = v.Detalles.Sum(d => (int?)d.Cantidad) ?? 0,
                    Total = v.Estado == "Abierta"
                        ? v.Detalles.Sum(d => (decimal?)d.Subtotal) ?? 0
                        : v.Total
                })
                .ToListAsync();

            return Ok(new
            {
                resumen,
                productosMasVendidos,
                productosStockBajo,
                ultimasVentas
            });
        }
    }
}
