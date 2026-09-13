using InventarioAPI.Data;
using InventarioAPI.DTOs;
using InventarioAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquivalenciasController : ControllerBase
    {
        private readonly InventarioDbContext _context;

        public EquivalenciasController(
            InventarioDbContext context)
        {
            _context = context;
        }


        // ==========================================================
        // GET - OBTENER TODAS LAS EQUIVALENCIAS
        // ==========================================================

        [HttpGet]
        public async Task<IActionResult> ObtenerEquivalencias()
        {
            var equivalencias =
                await _context.Equivalencias
                    .Select(e => new EquivalenciaDTO
                    {
                        IdEquivalencia = e.IdEquivalencia,
                        IdProducto = e.IdProducto,
                        Marca = e.Marca,
                        Codigo = e.Codigo
                    })
                    .ToListAsync();

            return Ok(equivalencias);
        }


        // ==========================================================
        // GET - OBTENER EQUIVALENCIAS DE UN PRODUCTO
        // ==========================================================

        [HttpGet("producto/{idProducto}")]
        public async Task<IActionResult> ObtenerPorProducto(
            int idProducto)
        {
            var productoExiste =
                await _context.Productos
                    .AnyAsync(p =>
                        p.IdProducto == idProducto);

            if (!productoExiste)
            {
                return NotFound(new
                {
                    mensaje = "Producto no encontrado."
                });
            }


            var equivalencias =
                await _context.Equivalencias
                    .Where(e =>
                        e.IdProducto == idProducto)
                    .Select(e => new EquivalenciaDTO
                    {
                        IdEquivalencia =
                            e.IdEquivalencia,

                        IdProducto =
                            e.IdProducto,

                        Marca =
                            e.Marca,

                        Codigo =
                            e.Codigo
                    })
                    .ToListAsync();


            return Ok(equivalencias);
        }


        // ==========================================================
        // POST - CREAR EQUIVALENCIA
        // ==========================================================

        [HttpPost]
        public async Task<IActionResult> CrearEquivalencia(
            CrearEquivalenciaDTO equivalenciaDTO)
        {
            // ------------------------------------------------------
            // VALIDAR MARCA
            // ------------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                equivalenciaDTO.Marca))
            {
                return BadRequest(new
                {
                    mensaje =
                        "La marca es obligatoria."
                });
            }


            // ------------------------------------------------------
            // VALIDAR CÓDIGO
            // ------------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                equivalenciaDTO.Codigo))
            {
                return BadRequest(new
                {
                    mensaje =
                        "El código de equivalencia es obligatorio."
                });
            }


            // ------------------------------------------------------
            // COMPROBAR PRODUCTO
            // ------------------------------------------------------

            var productoExiste =
                await _context.Productos
                    .AnyAsync(p =>
                        p.IdProducto ==
                        equivalenciaDTO.IdProducto);

            if (!productoExiste)
            {
                return NotFound(new
                {
                    mensaje =
                        "El producto no existe."
                });
            }


            // ------------------------------------------------------
            // COMPROBAR DUPLICADO
            // ------------------------------------------------------

            var equivalenciaExiste =
                await _context.Equivalencias
                    .AnyAsync(e =>
                        e.IdProducto ==
                            equivalenciaDTO.IdProducto
                        &&
                        e.Marca.ToLower() ==
                            equivalenciaDTO.Marca
                                .Trim()
                                .ToLower()
                        &&
                        e.Codigo.ToLower() ==
                            equivalenciaDTO.Codigo
                                .Trim()
                                .ToLower()
                    );


            if (equivalenciaExiste)
            {
                return Conflict(new
                {
                    mensaje =
                        "Esta equivalencia ya existe para el producto."
                });
            }


            // ------------------------------------------------------
            // CREAR
            // ------------------------------------------------------

            var equivalencia =
                new Equivalencia
                {
                    IdProducto =
                        equivalenciaDTO.IdProducto,

                    Marca =
                        equivalenciaDTO.Marca.Trim(),

                    Codigo =
                        equivalenciaDTO.Codigo.Trim()
                };


            _context.Equivalencias.Add(
                equivalencia);


            await _context.SaveChangesAsync();


            // ------------------------------------------------------
            // RESPUESTA
            // ------------------------------------------------------

            return CreatedAtAction(
                nameof(ObtenerPorProducto),
                new
                {
                    idProducto =
                        equivalencia.IdProducto
                },
                new EquivalenciaDTO
                {
                    IdEquivalencia =
                        equivalencia.IdEquivalencia,

                    IdProducto =
                        equivalencia.IdProducto,

                    Marca =
                        equivalencia.Marca,

                    Codigo =
                        equivalencia.Codigo
                }
            );
        }


        // ==========================================================
        // DELETE - ELIMINAR EQUIVALENCIA
        // ==========================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarEquivalencia(
            int id)
        {
            var equivalencia =
                await _context.Equivalencias
                    .FirstOrDefaultAsync(e =>
                        e.IdEquivalencia == id);


            if (equivalencia == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "Equivalencia no encontrada."
                });
            }


            _context.Equivalencias.Remove(
                equivalencia);


            await _context.SaveChangesAsync();


            return Ok(new
            {
                mensaje =
                    "Equivalencia eliminada correctamente."
            });
        }
    }
}