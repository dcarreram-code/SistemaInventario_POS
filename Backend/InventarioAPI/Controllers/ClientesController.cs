using InventarioAPI.Data;
using InventarioAPI.DTOs;
using InventarioAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientesController : ControllerBase
    {
        private readonly InventarioDbContext _context;

        public ClientesController(InventarioDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> Obtener(
            [FromQuery] string? buscar,
            [FromQuery] bool incluirInactivos = false)
        {
            var consulta = _context.Clientes.AsQueryable();
            if (!incluirInactivos)
                consulta = consulta.Where(c => c.Activo);

            if (!string.IsNullOrWhiteSpace(buscar))
            {
                var termino = buscar.Trim();
                consulta = consulta.Where(c =>
                    c.Nombre.Contains(termino) ||
                    c.Telefono.Contains(termino) ||
                    (c.DpiNit ?? "").Contains(termino));
            }

            return Ok(await consulta
                .OrderBy(c => c.Nombre)
                .Select(c => new
                {
                    c.IdCliente,
                    c.Nombre,
                    c.Telefono,
                    c.DpiNit,
                    c.Direccion,
                    c.Activo,
                    SaldoPendiente = c.Ventas
                        .Where(v => v.Estado == "PendientePago")
                        .Sum(v => (decimal?)v.Total) -
                        c.Ventas
                            .Where(v => v.Estado == "PendientePago")
                            .SelectMany(v => v.Pagos)
                            .Sum(p => (decimal?)p.Monto) ?? 0,
                    CuentasPendientes = c.Ventas.Count(v => v.Estado == "PendientePago")
                })
                .ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Obtener(int id)
        {
            var cliente = await _context.Clientes
                .Where(c => c.IdCliente == id)
                .Select(c => new
                {
                    c.IdCliente,
                    c.Nombre,
                    c.Telefono,
                    c.DpiNit,
                    c.Direccion,
                    c.Activo,
                    SaldoPendiente = c.Ventas
                        .Where(v => v.Estado == "PendientePago")
                        .Sum(v => (decimal?)v.Total) -
                        c.Ventas
                            .Where(v => v.Estado == "PendientePago")
                            .SelectMany(v => v.Pagos)
                            .Sum(p => (decimal?)p.Monto) ?? 0,
                    CuentasPendientes = c.Ventas.Count(v => v.Estado == "PendientePago"),
                    Historial = c.Ventas
                        .OrderByDescending(v => v.FechaCierre ?? v.FechaApertura)
                        .Select(v => new
                        {
                            v.IdVenta,
                            v.Total,
                            v.Estado,
                            v.FechaApertura,
                            v.FechaCierre,
                            TotalPagado = v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0,
                            SaldoPendiente = v.Estado == "PendientePago"
                                ? v.Total - (v.Pagos.Sum(p => (decimal?)p.Monto) ?? 0)
                                : 0
                        })
                })
                .FirstOrDefaultAsync();

            return cliente == null
                ? NotFound(new { mensaje = "Cliente no encontrado." })
                : Ok(cliente);
        }

        [HttpPost]
        public async Task<IActionResult> Crear(CrearClienteDTO dto)
        {
            var nombre = dto.Nombre.Trim();
            var telefono = dto.Telefono.Trim();
            if (nombre.Length < 2)
                return BadRequest(new { mensaje = "Ingrese el nombre del cliente." });
            if (!TelefonoValido(telefono))
                return BadRequest(new { mensaje = "Ingrese un número de teléfono válido." });

            var cliente = new Cliente
            {
                Nombre = nombre,
                Telefono = telefono,
                DpiNit = Limpiar(dto.DpiNit),
                Direccion = Limpiar(dto.Direccion),
                Activo = true,
                FechaRegistro = DateTime.Now
            };

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Obtener), new { id = cliente.IdCliente }, new
            {
                cliente.IdCliente,
                cliente.Nombre,
                cliente.Telefono,
                cliente.DpiNit,
                cliente.Direccion,
                cliente.Activo
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, ActualizarClienteDTO dto)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
                return NotFound(new { mensaje = "Cliente no encontrado." });

            var telefono = dto.Telefono.Trim();
            if (dto.Nombre.Trim().Length < 2)
                return BadRequest(new { mensaje = "Ingrese el nombre del cliente." });
            if (!TelefonoValido(telefono))
                return BadRequest(new { mensaje = "Ingrese un número de teléfono válido." });

            cliente.Nombre = dto.Nombre.Trim();
            cliente.Telefono = telefono;
            cliente.DpiNit = Limpiar(dto.DpiNit);
            cliente.Direccion = Limpiar(dto.Direccion);
            cliente.Activo = dto.Activo;
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Cliente actualizado correctamente." });
        }

        [HttpPost("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoClienteDTO dto)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
                return NotFound(new { mensaje = "Cliente no encontrado." });

            cliente.Activo = dto.Activo;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                mensaje = dto.Activo ? "Cliente reactivado correctamente." : "Cliente desactivado correctamente.",
                cliente.Activo
            });
        }

        private static string? Limpiar(string? valor) =>
            string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();

        private static bool TelefonoValido(string telefono) =>
            telefono.Count(char.IsDigit) >= 7 &&
            telefono.All(caracter =>
                char.IsDigit(caracter) ||
                caracter == '+' ||
                caracter == ' ' ||
                caracter == '-' ||
                caracter == '(' ||
                caracter == ')');
    }

    public class CambiarEstadoClienteDTO
    {
        public bool Activo { get; set; }
    }
}
