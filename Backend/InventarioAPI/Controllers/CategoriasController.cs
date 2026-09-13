using InventarioAPI.Data;
using InventarioAPI.DTOs;
using InventarioAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly InventarioDbContext _context;

        public CategoriasController(InventarioDbContext context)
        {
            _context = context;
        }


        // ==========================================================
        // GET - OBTENER CATEGORÍAS ACTIVAS
        // ==========================================================

        [HttpGet]
        public async Task<IActionResult> ObtenerCategorias()
        {
            var categorias = await _context.Categorias
                .Where(c => c.Estado)
                .Select(c => new CategoriaDTO
                {
                    IdCategoria = c.IdCategoria,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion
                })
                .ToListAsync();

            return Ok(categorias);
        }


        // ==========================================================
        // GET - OBTENER CATEGORÍA POR ID
        // ==========================================================

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerCategoria(int id)
        {
            var categoria = await _context.Categorias
                .Where(c => c.IdCategoria == id)
                .Select(c => new CategoriaDTO
                {
                    IdCategoria = c.IdCategoria,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion
                })
                .FirstOrDefaultAsync();

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensaje = "Categoría no encontrada"
                });
            }

            return Ok(categoria);
        }


        // ==========================================================
        // POST - CREAR CATEGORÍA
        // ==========================================================

        [HttpPost]
        public async Task<IActionResult> CrearCategoria(
            CrearCategoriaDTO categoriaDTO)
        {
            // ------------------------------------------------------
            // VALIDAR NOMBRE
            // ------------------------------------------------------

            if (string.IsNullOrWhiteSpace(categoriaDTO.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre de la categoría es obligatorio."
                });
            }


            // ------------------------------------------------------
            // COMPROBAR NOMBRE DUPLICADO
            // ------------------------------------------------------

            var nombreExiste = await _context.Categorias
                .AnyAsync(c =>
                    c.Nombre.ToLower() ==
                    categoriaDTO.Nombre.Trim().ToLower());

            if (nombreExiste)
            {
                return Conflict(new
                {
                    mensaje = "Ya existe una categoría con ese nombre."
                });
            }


            // ------------------------------------------------------
            // CREAR CATEGORÍA
            // ------------------------------------------------------

            var categoria = new Categoria
            {
                Nombre = categoriaDTO.Nombre.Trim(),
                Descripcion = categoriaDTO.Descripcion,
                Estado = true
            };

            _context.Categorias.Add(categoria);

            await _context.SaveChangesAsync();


            return CreatedAtAction(
                nameof(ObtenerCategoria),
                new { id = categoria.IdCategoria },
                new CategoriaDTO
                {
                    IdCategoria = categoria.IdCategoria,
                    Nombre = categoria.Nombre,
                    Descripcion = categoria.Descripcion
                }
            );
        }


        // ==========================================================
        // PUT - ACTUALIZAR CATEGORÍA
        // ==========================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCategoria(
            int id,
            ActualizarCategoriaDTO categoriaDTO)
        {
            var categoria = await _context.Categorias
                .FirstOrDefaultAsync(c =>
                    c.IdCategoria == id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensaje = "Categoría no encontrada"
                });
            }


            // ------------------------------------------------------
            // VALIDAR NOMBRE
            // ------------------------------------------------------

            if (string.IsNullOrWhiteSpace(categoriaDTO.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre de la categoría es obligatorio."
                });
            }


            // ------------------------------------------------------
            // COMPROBAR NOMBRE DUPLICADO
            // ------------------------------------------------------

            var nombreExiste = await _context.Categorias
                .AnyAsync(c =>
                    c.IdCategoria != id &&
                    c.Nombre.ToLower() ==
                    categoriaDTO.Nombre.Trim().ToLower());

            if (nombreExiste)
            {
                return Conflict(new
                {
                    mensaje = "Ya existe otra categoría con ese nombre."
                });
            }


            // ------------------------------------------------------
            // ACTUALIZAR
            // ------------------------------------------------------

            categoria.Nombre =
                categoriaDTO.Nombre.Trim();

            categoria.Descripcion =
                categoriaDTO.Descripcion;

            await _context.SaveChangesAsync();


            return Ok(new CategoriaDTO
            {
                IdCategoria = categoria.IdCategoria,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion
            });
        }


        // ==========================================================
        // DELETE - DESACTIVAR CATEGORÍA
        // ==========================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCategoria(int id)
        {
            var categoria = await _context.Categorias
                .FirstOrDefaultAsync(c =>
                    c.IdCategoria == id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensaje = "Categoría no encontrada"
                });
            }


            // ------------------------------------------------------
            // COMPROBAR PRODUCTOS ACTIVOS
            // ------------------------------------------------------

            var tieneProductosActivos =
                await _context.Productos
                    .AnyAsync(p =>
                        p.IdCategoria == id &&
                        p.Estado);


            if (tieneProductosActivos)
            {
                return Conflict(new
                {
                    mensaje =
                        "No se puede desactivar la categoría porque tiene productos activos asociados."
                });
            }


            // ------------------------------------------------------
            // DESACTIVAR
            // ------------------------------------------------------

            categoria.Estado = false;

            await _context.SaveChangesAsync();


            return Ok(new
            {
                mensaje =
                    "Categoría desactivada correctamente."
            });
        }


        // ==========================================================
        // GET - CATEGORÍAS DESACTIVADAS
        // ==========================================================

        [HttpGet("desactivadas")]
        public async Task<IActionResult> ObtenerCategoriasDesactivadas()
        {
            var categorias = await _context.Categorias
                .Where(c => !c.Estado)
                .Select(c => new CategoriaDTO
                {
                    IdCategoria = c.IdCategoria,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion
                })
                .ToListAsync();

            return Ok(categorias);
        }


        // ==========================================================
        // PUT - REACTIVAR CATEGORÍA
        // ==========================================================

        [HttpPut("reactivar/{id}")]
        public async Task<IActionResult> ReactivarCategoria(int id)
        {
            var categoria = await _context.Categorias
                .FirstOrDefaultAsync(c =>
                    c.IdCategoria == id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensaje = "Categoría no encontrada."
                });
            }


            if (categoria.Estado)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La categoría ya está activa."
                });
            }


            categoria.Estado = true;

            await _context.SaveChangesAsync();


            return Ok(new
            {
                mensaje =
                    "Categoría reactivada correctamente."
            });
        }
    }
}