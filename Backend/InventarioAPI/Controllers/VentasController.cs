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
    public class VentasController : ControllerBase
    {
        private readonly InventarioDbContext _context;

        public VentasController(InventarioDbContext context) => _context = context;

        [HttpGet("abiertas")]
        public async Task<IActionResult> ObtenerAbiertas() => Ok(await _context.Ventas
            .Where(v => v.Estado == "Abierta")
            .OrderByDescending(v => v.FechaApertura)
            .Select(v => new {
                v.IdVenta, v.Vehiculo, v.Placa, v.Observaciones, v.FechaApertura,
                v.IdCliente,
                Total = v.Detalles.Sum(d => (decimal?)d.Subtotal) ?? 0,
                CantidadProductos = v.Detalles.Sum(d => (int?)d.Cantidad) ?? 0
            }).ToListAsync());

        [HttpGet("pendientes-pago")]
        public async Task<IActionResult> ObtenerPendientesPago() => Ok(await _context.Ventas
            .Where(v => v.Estado == "PendientePago")
            .OrderByDescending(v => v.FechaCierre)
            .Select(v => new
            {
                v.IdVenta,
                v.IdCliente,
                v.NombreCliente,
                v.TelefonoCliente,
                v.Vehiculo,
                v.Placa,
                v.FechaCierre,
                v.Total,
                TotalPagado = v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0,
                SaldoPendiente = v.Total - (v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0),
                CantidadProductos = v.Detalles.Sum(d => (int?)d.Cantidad) ?? 0
            })
            .ToListAsync());

        [HttpGet("historial")]
        public async Task<IActionResult> ObtenerHistorial(
            [FromQuery] string? vehiculo,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
            var consulta = _context.Ventas
                .Where(v => v.Estado == "Completada" || v.Estado == "Anulada");

            if (!string.IsNullOrWhiteSpace(vehiculo))
            {
                var termino = vehiculo.Trim();
                consulta = consulta.Where(v =>
                    v.Vehiculo.Contains(termino) ||
                    (v.Placa ?? "").Contains(termino));
            }

            if (desde.HasValue)
                consulta = consulta.Where(v =>
                    v.FechaCierre.HasValue &&
                    v.FechaCierre.Value >= desde.Value.Date);

            if (hasta.HasValue)
                consulta = consulta.Where(v =>
                    v.FechaCierre.HasValue &&
                    v.FechaCierre.Value < hasta.Value.Date.AddDays(1));

            var ventas = await consulta
                .OrderByDescending(v => v.FechaCierre)
                .Select(v => new
                {
                    v.IdVenta,
                    v.IdCliente,
                    v.Vehiculo,
                    v.Placa,
                    v.Estado,
                    v.FechaApertura,
                    v.FechaCierre,
                    v.Total,
                    CantidadProductos = v.Detalles.Sum(d => (int?)d.Cantidad) ?? 0
                })
                .ToListAsync();

            return Ok(ventas);
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> Buscar(
            [FromQuery] string? vehiculo,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
            var consulta = _context.Ventas.Where(v => v.Estado == "Completada" || v.Estado == "Anulada");
            if (!string.IsNullOrWhiteSpace(vehiculo))
            {
                var termino = vehiculo.Trim();
                consulta = consulta.Where(v => v.Vehiculo.Contains(termino) || (v.Placa ?? "").Contains(termino));
            }
            if (desde.HasValue) consulta = consulta.Where(v => v.FechaCierre >= desde.Value.Date);
            if (hasta.HasValue) consulta = consulta.Where(v => v.FechaCierre < hasta.Value.Date.AddDays(1));

            return Ok(await consulta.OrderByDescending(v => v.FechaCierre).Select(v => new
            {
                v.IdVenta, v.Vehiculo, v.Placa, v.Estado, v.FechaCierre, v.Total,
                CantidadProductos = v.Detalles.Sum(d => (int?)d.Cantidad) ?? 0
            }).ToListAsync());
        }

        [HttpGet("reporte")]
        public async Task<IActionResult> Reporte([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
        {
            if (hasta.Date < desde.Date)
                return BadRequest(new { mensaje = "La fecha final no puede ser anterior a la inicial." });

            var ventas = await _context.Ventas
                .Where(v =>
                    v.Estado == "Completada" &&
                    v.FechaCierre.HasValue &&
                    v.FechaCierre.Value >= desde.Date &&
                    v.FechaCierre.Value < hasta.Date.AddDays(1))
                .Include(v => v.Detalles)
                .OrderBy(v => v.FechaCierre)
                .ToListAsync();

            var detalleVentas = ventas.Select(v =>
            {
                var costo = v.Detalles.Sum(d => d.CostoUnitario * d.Cantidad);
                var cantidadProductos = v.Detalles.Sum(d => d.Cantidad);

                return new
                {
                    v.IdVenta,
                    v.Vehiculo,
                    v.Placa,
                    v.FechaCierre,
                    CantidadProductos = cantidadProductos,
                    Total = v.Total,
                    Costo = costo,
                    Ganancia = v.Total - costo
                };
            }).ToList();

            var ingresos = detalleVentas.Sum(v => v.Total);
            var costos = detalleVentas.Sum(v => v.Costo);

            return Ok(new
            {
                desde = desde.Date,
                hasta = hasta.Date,
                cantidadVentas = detalleVentas.Count,
                productosVendidos = detalleVentas.Sum(v => v.CantidadProductos),
                ingresos,
                costos,
                ganancia = ingresos - costos,
                ventas = detalleVentas
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Obtener(int id)
        {
            var venta = await _context.Ventas
                .Where(v => v.IdVenta == id)
                .Select(v => new
                {
                    v.IdVenta,
                    v.IdCliente,
                    v.Vehiculo,
                    v.Placa,
                    v.NombreCliente,
                    v.TelefonoCliente,
                    v.Observaciones,
                    v.Estado,
                    v.FechaApertura,
                    v.FechaCierre,
                    v.Total,
                    TotalPagado = v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0,
                    SaldoPendiente = v.Total - (v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0),
                    Detalles = v.Detalles.Select(d => new
                    {
                        d.IdDetalleVenta,
                        d.IdProducto,
                        d.NombreProducto,
                        d.CodigoBarras,
                        d.Cantidad,
                        d.PrecioUnitario,
                        d.CostoUnitario,
                        d.Subtotal
                    }),
                    Pagos = v.Pagos.OrderBy(p => p.Fecha).ThenBy(p => p.IdPagoVenta).Select(p => new
                    {
                        p.IdPagoVenta,
                        p.Monto,
                        p.Fecha
                    })
                })
                .FirstOrDefaultAsync();

            return venta == null
                ? NotFound(new { mensaje = "Venta no encontrada." })
                : Ok(venta);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(CrearVentaDTO dto)
        {
            Cliente? cliente = null;
            if (dto.IdCliente.HasValue)
            {
                cliente = await _context.Clientes
                    .FirstOrDefaultAsync(c => c.IdCliente == dto.IdCliente && c.Activo);
                if (cliente == null)
                    return BadRequest(new { mensaje = "El cliente seleccionado no existe o está inactivo." });
            }

            var venta = new Venta {
                IdCliente = cliente?.IdCliente,
                NombreCliente = cliente?.Nombre,
                TelefonoCliente = cliente?.Telefono,
                Vehiculo = dto.Vehiculo.Trim(), Placa = dto.Placa?.Trim(),
                Observaciones = dto.Observaciones?.Trim(), FechaApertura = DateTime.Now
            };
            _context.Ventas.Add(venta);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Obtener), new { id = venta.IdVenta }, new
            {
                venta.IdVenta,
                venta.IdCliente,
                venta.Vehiculo,
                venta.Placa,
                venta.NombreCliente,
                venta.TelefonoCliente,
                venta.Estado,
                venta.FechaApertura
            });
        }

        [HttpPost("{id}/detalles")]
        public async Task<IActionResult> AgregarDetalle(int id, AgregarDetalleVentaDTO dto)
        {
            var venta = await _context.Ventas.Include(v => v.Detalles)
                .FirstOrDefaultAsync(v => v.IdVenta == id && v.Estado == "Abierta");
            if (venta == null) return BadRequest(new { mensaje = "La venta no esta abierta." });

            var producto = await _context.Productos.FirstOrDefaultAsync(p => p.IdProducto == dto.IdProducto && p.Estado);
            if (producto == null) return NotFound(new { mensaje = "Producto activo no encontrado." });

            var detalle = venta.Detalles.FirstOrDefault(d => d.IdProducto == producto.IdProducto);
            if (detalle == null) {
                detalle = new DetalleVenta {
                    IdProducto = producto.IdProducto, NombreProducto = producto.Nombre,
                    CodigoBarras = producto.CodigoBarras, Cantidad = dto.Cantidad,
                    PrecioUnitario = producto.PrecioVenta, CostoUnitario = producto.PrecioCompra,
                    Subtotal = producto.PrecioVenta * dto.Cantidad
                };
                venta.Detalles.Add(detalle);
            } else {
                detalle.Cantidad += dto.Cantidad;
                detalle.Subtotal = detalle.Cantidad * detalle.PrecioUnitario;
            }
            await _context.SaveChangesAsync();
            return Ok(new
            {
                detalle.IdDetalleVenta,
                detalle.IdProducto,
                detalle.NombreProducto,
                detalle.CodigoBarras,
                detalle.Cantidad,
                detalle.PrecioUnitario,
                detalle.CostoUnitario,
                detalle.Subtotal
            });
        }

        [HttpPut("{id}/detalles/{idDetalle}")]
        public async Task<IActionResult> ActualizarDetalle(int id, int idDetalle, ActualizarDetalleVentaDTO dto)
        {
            var detalle = await _context.DetallesVenta.Include(d => d.Venta)
                .FirstOrDefaultAsync(d => d.IdDetalleVenta == idDetalle && d.IdVenta == id);
            if (detalle == null || detalle.Venta?.Estado != "Abierta") return BadRequest(new { mensaje = "Detalle no disponible." });
            detalle.Cantidad = dto.Cantidad;
            detalle.Subtotal = detalle.Cantidad * detalle.PrecioUnitario;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                detalle.IdDetalleVenta,
                detalle.IdProducto,
                detalle.NombreProducto,
                detalle.CodigoBarras,
                detalle.Cantidad,
                detalle.PrecioUnitario,
                detalle.CostoUnitario,
                detalle.Subtotal
            });
        }

        [HttpDelete("{id}/detalles/{idDetalle}")]
        public async Task<IActionResult> EliminarDetalle(int id, int idDetalle)
        {
            var detalle = await _context.DetallesVenta.Include(d => d.Venta)
                .FirstOrDefaultAsync(d => d.IdDetalleVenta == idDetalle && d.IdVenta == id);
            if (detalle == null || detalle.Venta?.Estado != "Abierta") return BadRequest(new { mensaje = "Detalle no disponible." });
            _context.DetallesVenta.Remove(detalle);
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Producto retirado de la cuenta." });
        }

        [HttpPost("{id}/concretar")]
        public async Task<IActionResult> Concretar(int id)
        {
            await using var transaccion = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var venta = await _context.Ventas.Include(v => v.Detalles)
                .FirstOrDefaultAsync(v => v.IdVenta == id && v.Estado == "Abierta");
            if (venta == null) return BadRequest(new { mensaje = "La venta no esta abierta." });
            var errorStock = await DescontarStockVenta(venta, $"Venta #{venta.IdVenta}");
            if (errorStock != null) return BadRequest(new { mensaje = errorStock });

            venta.Total = venta.Detalles.Sum(d => d.Subtotal);
            venta.Estado = "Completada";
            venta.FechaCierre = DateTime.Now;
            _context.PagosVenta.Add(new PagoVenta
            {
                IdVenta = venta.IdVenta,
                Monto = venta.Total,
                Fecha = venta.FechaCierre.Value
            });
            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();
            return Ok(new { mensaje = "Venta concretada correctamente.", venta.IdVenta, venta.Total });
        }

        [HttpPost("{id}/pendiente-pago")]
        public async Task<IActionResult> GuardarPendientePago(int id, CrearVentaPendientePagoDTO dto)
        {
            Cliente? cliente = null;
            if (dto.IdCliente.HasValue)
            {
                cliente = await _context.Clientes
                    .FirstOrDefaultAsync(c => c.IdCliente == dto.IdCliente && c.Activo);
                if (cliente == null)
                    return BadRequest(new { mensaje = "El cliente seleccionado no existe o está inactivo." });
            }

            var nombreCliente = cliente?.Nombre ?? dto.NombreCliente.Trim();
            var telefonoCliente = cliente?.Telefono ?? dto.TelefonoCliente.Trim();
            var vehiculo = dto.Vehiculo.Trim();
            var placa = dto.Placa.Trim();
            if (cliente == null &&
                nombreCliente.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length < 2)
                return BadRequest(new { mensaje = "Ingrese el nombre completo del cliente." });
            if (telefonoCliente.Count(char.IsDigit) < 7 ||
                telefonoCliente.Any(caracter =>
                    !char.IsDigit(caracter) &&
                    caracter != '+' &&
                    caracter != ' ' &&
                    caracter != '-' &&
                    caracter != '(' &&
                    caracter != ')'))
                return BadRequest(new { mensaje = "Ingrese un número de teléfono válido." });

            await using var transaccion = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var venta = await _context.Ventas.Include(v => v.Detalles)
                .FirstOrDefaultAsync(v => v.IdVenta == id && v.Estado == "Abierta");
            if (venta == null) return BadRequest(new { mensaje = "La venta no esta abierta." });

            var errorStock = await DescontarStockVenta(venta, $"Venta al crédito #{venta.IdVenta}");
            if (errorStock != null) return BadRequest(new { mensaje = errorStock });

            venta.NombreCliente = nombreCliente;
            venta.TelefonoCliente = telefonoCliente;
            venta.IdCliente = cliente?.IdCliente;
            venta.Vehiculo = vehiculo;
            venta.Placa = placa;
            venta.Total = venta.Detalles.Sum(d => d.Subtotal);
            venta.Estado = "PendientePago";
            venta.FechaCierre = DateTime.Now;

            if (cliente == null)
            {
                cliente = await _context.Clientes.FirstOrDefaultAsync(c =>
                    c.Nombre == nombreCliente && c.Telefono == telefonoCliente);
                if (cliente == null)
                {
                    cliente = new Cliente
                    {
                        Nombre = nombreCliente,
                        Telefono = telefonoCliente,
                        Activo = true,
                        FechaRegistro = DateTime.Now
                    };
                    _context.Clientes.Add(cliente);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    cliente.Activo = true;
                }
            }

            venta.IdCliente = cliente.IdCliente;
            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();
            return Ok(new
            {
                mensaje = "La venta quedó registrada en pendientes de pago.",
                venta.IdVenta,
                venta.Total
            });
        }

        [HttpPost("{id}/pagos")]
        public async Task<IActionResult> RegistrarPago(int id, RegistrarPagoVentaDTO dto)
        {
            if (dto.Monto <= 0)
                return BadRequest(new { mensaje = "El monto del pago debe ser mayor que cero." });
            if (decimal.Round(dto.Monto, 2) != dto.Monto)
                return BadRequest(new { mensaje = "El monto del pago solo puede tener hasta dos decimales." });

            await using var transaccion = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var venta = await _context.Ventas.Include(v => v.Pagos)
                .FirstOrDefaultAsync(v => v.IdVenta == id && v.Estado == "PendientePago");
            if (venta == null)
                return BadRequest(new { mensaje = "La venta no está pendiente de pago." });

            var totalPagado = venta.Pagos.Sum(p => p.Monto);
            var saldoPendiente = venta.Total - totalPagado;
            if (dto.Monto > saldoPendiente)
                return BadRequest(new { mensaje = $"El pago no puede superar el saldo pendiente de Q{saldoPendiente:F2}." });

            var fechaPago = DateTime.Now;
            var pago = new PagoVenta
            {
                IdVenta = venta.IdVenta,
                Monto = dto.Monto,
                Fecha = fechaPago
            };
            _context.PagosVenta.Add(pago);

            var nuevoSaldo = saldoPendiente - dto.Monto;
            if (nuevoSaldo == 0)
            {
                venta.Estado = "Completada";
                venta.FechaCierre = fechaPago;
            }

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();
            return Ok(new
            {
                mensaje = nuevoSaldo == 0
                    ? "Pago registrado. La venta quedó saldada y se agregó al historial."
                    : "Abono registrado correctamente.",
                venta.IdVenta,
                Pago = new { pago.IdPagoVenta, pago.Monto, pago.Fecha },
                TotalPagado = totalPagado + dto.Monto,
                SaldoPendiente = nuevoSaldo,
                VentaCompletada = nuevoSaldo == 0
            });
        }

        [HttpPost("{id}/cancelar")]
        public async Task<IActionResult> Cancelar(int id)
        {
            var venta = await _context.Ventas.FirstOrDefaultAsync(v => v.IdVenta == id && v.Estado == "Abierta");
            if (venta == null) return BadRequest(new { mensaje = "La venta no esta abierta." });
            venta.Estado = "Cancelada";
            venta.FechaCierre = DateTime.Now;
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Cuenta cancelada sin afectar inventario." });
        }

        [HttpPost("{id}/anular")]
        public async Task<IActionResult> Anular(int id)
        {
            await using var transaccion = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            var venta = await _context.Ventas.Include(v => v.Detalles)
                .FirstOrDefaultAsync(v => v.IdVenta == id && v.Estado == "Completada");
            if (venta == null) return BadRequest(new { mensaje = "Solo se pueden anular ventas completadas." });

            var productos = await _context.Productos.Where(p => venta.Detalles.Select(d => d.IdProducto).Contains(p.IdProducto))
                .ToDictionaryAsync(p => p.IdProducto);
            foreach (var detalle in venta.Detalles)
            {
                var producto = productos[detalle.IdProducto];
                var anterior = producto.Stock;
                producto.Stock += detalle.Cantidad;
                _context.MovimientosInventario.Add(new MovimientoInventario
                {
                    IdProducto = producto.IdProducto, IdVenta = venta.IdVenta, Tipo = "AnulacionVenta",
                    Cantidad = detalle.Cantidad, StockAnterior = anterior, StockPosterior = producto.Stock,
                    Fecha = DateTime.Now, Descripcion = $"Anulacion de venta #{venta.IdVenta}"
                });
            }
            venta.Estado = "Anulada";
            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();
            return Ok(new { mensaje = "Venta anulada y stock devuelto correctamente." });
        }

        private async Task<string?> DescontarStockVenta(Venta venta, string descripcion)
        {
            if (venta.Detalles.Count == 0)
                return "Agregue al menos un producto.";

            var ids = venta.Detalles.Select(d => d.IdProducto).ToList();
            var productos = await _context.Productos
                .Where(p => ids.Contains(p.IdProducto))
                .ToDictionaryAsync(p => p.IdProducto);

            foreach (var detalle in venta.Detalles)
            {
                if (!productos.TryGetValue(detalle.IdProducto, out var producto) ||
                    !producto.Estado ||
                    producto.Stock < detalle.Cantidad)
                    return $"Stock insuficiente para {detalle.NombreProducto}.";
            }

            foreach (var detalle in venta.Detalles)
            {
                var producto = productos[detalle.IdProducto];
                var anterior = producto.Stock;
                producto.Stock -= detalle.Cantidad;
                _context.MovimientosInventario.Add(new MovimientoInventario
                {
                    IdProducto = producto.IdProducto,
                    IdVenta = venta.IdVenta,
                    Tipo = "Venta",
                    Cantidad = -detalle.Cantidad,
                    StockAnterior = anterior,
                    StockPosterior = producto.Stock,
                    Fecha = DateTime.Now,
                    Descripcion = descripcion
                });
            }

            return null;
        }
    }
}
