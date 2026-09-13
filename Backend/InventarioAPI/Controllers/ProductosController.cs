using InventarioAPI.Data;
using InventarioAPI.DTOs;
using InventarioAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly InventarioDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProductosController(
            InventarioDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

       [HttpGet]
public async Task<IActionResult> ObtenerProductos()
{
    var productos = await _context.Productos
        .Where(p => p.Estado)
        .Include(p => p.Categoria)
        .Select(p => new ProductoDTO
        {
            IdProducto = p.IdProducto,
            CodigoBarras = p.CodigoBarras,
            Nombre = p.Nombre,
            IdCategoria = p.IdCategoria,
            Categoria = p.Categoria != null ? p.Categoria.Nombre : "",
            PrecioCompra = p.PrecioCompra,
            PrecioVenta = p.PrecioVenta,
            Descripcion = p.Descripcion,
            Imagen = p.Imagen,
            Stock = p.Stock,
            Bodega = p.Bodega,
            Estanteria = p.Estanteria,
            Fila = p.Fila,
            FechaRegistro = p.FechaRegistro,
            Estado = p.Estado
        })
        .ToListAsync();

    return Ok(productos);
}

[HttpGet("{id}")]
public async Task<IActionResult> ObtenerProducto(int id)
{
    var producto = await _context.Productos
        .Include(p => p.Categoria)
        .FirstOrDefaultAsync(p => p.IdProducto == id);

    if (producto == null)
    {
        return NotFound(new
        {
            mensaje = "Producto no encontrado"
        });
    }

    var productoDTO = new ProductoDTO
    {
        IdProducto = producto.IdProducto,
        CodigoBarras = producto.CodigoBarras,
        Nombre = producto.Nombre,
        IdCategoria = producto.IdCategoria,
        Categoria = producto.Categoria?.Nombre ?? "",
        PrecioCompra = producto.PrecioCompra,
        PrecioVenta = producto.PrecioVenta,
        Descripcion = producto.Descripcion,
        Imagen = producto.Imagen,
        Stock = producto.Stock,
        Bodega = producto.Bodega,
        Estanteria = producto.Estanteria,
        Fila = producto.Fila,
        FechaRegistro = producto.FechaRegistro,
        Estado = producto.Estado
    };

    return Ok(productoDTO);
}


// ==========================================================
// GET - BUSCAR PRODUCTOS
// Busca por nombre, código de barras, descripción,
// marca de equivalencia o código de equivalencia.
// ==========================================================

[HttpGet("buscar")]
public async Task<IActionResult> BuscarProductos(
    [FromQuery] string? termino)
{
    // ------------------------------------------------------
    // VALIDAR TÉRMINO
    // ------------------------------------------------------

    if (string.IsNullOrWhiteSpace(termino))
    {
        return Ok(new List<ProductoDTO>());
    }

    termino = termino.Trim();

    // ------------------------------------------------------
    // BUSCAR PRODUCTOS
    // ------------------------------------------------------

    var productos = await _context.Productos
        .Where(p => p.Estado)
        .Where(p =>
            EF.Functions.Like(
                p.Nombre,
                $"%{termino}%"
            )
            ||
            EF.Functions.Like(
                p.CodigoBarras,
                $"%{termino}%"
            )
            ||
            EF.Functions.Like(
                p.Descripcion ?? "",
                $"%{termino}%"
            )
            ||
            p.Equivalencias.Any(e =>
                EF.Functions.Like(
                    e.Marca,
                    $"%{termino}%"
                )
                ||
                EF.Functions.Like(
                    e.Codigo,
                    $"%{termino}%"
                )
            )
        )
        .Include(p => p.Categoria)
        .Select(p => new ProductoDTO
        {
            IdProducto = p.IdProducto,
            CodigoBarras = p.CodigoBarras,
            Nombre = p.Nombre,
            IdCategoria = p.IdCategoria,
            Categoria = p.Categoria != null
                ? p.Categoria.Nombre
                : "",
            PrecioCompra = p.PrecioCompra,
            PrecioVenta = p.PrecioVenta,
            Descripcion = p.Descripcion,
            Imagen = p.Imagen,
            Stock = p.Stock,
            Bodega = p.Bodega,
            Estanteria = p.Estanteria,
            Fila = p.Fila,
            FechaRegistro = p.FechaRegistro,
            Estado = p.Estado
        })
        .ToListAsync();

    // ------------------------------------------------------
    // RESPUESTA
    // ------------------------------------------------------

    return Ok(productos);
}


[HttpPut("{id}")]
public async Task<IActionResult> ActualizarProducto(
    int id,
    [FromForm] ActualizarProductoDTO productoDTO)
{
    var producto = await _context.Productos
        .FirstOrDefaultAsync(p => p.IdProducto == id);

    if (producto == null)
    {
        return NotFound(new
        {
            mensaje = "Producto no encontrado"
        });
    }


    // ==================================================
    // VALIDAR PRECIOS
    // ==================================================

    if (productoDTO.PrecioVenta < productoDTO.PrecioCompra)
    {
        return BadRequest(new
        {
            mensaje = "El precio de venta no puede ser menor que el precio de compra."
        });
    }


    // ==================================================
    // VALIDAR CÓDIGO DE BARRAS
    // ==================================================

    var codigoExiste = await _context.Productos
        .AnyAsync(p =>
            p.CodigoBarras == productoDTO.CodigoBarras &&
            p.IdProducto != id
        );

    if (codigoExiste)
    {
        return Conflict(new
        {
            mensaje = "Ya existe otro producto con ese código de barras."
        });
    }


    // ==================================================
    // GUARDAR DATOS DEL PRODUCTO
    // ==================================================

    producto.CodigoBarras =
        productoDTO.CodigoBarras;

    producto.Nombre =
        productoDTO.Nombre;

    producto.IdCategoria =
        productoDTO.IdCategoria;

    producto.PrecioCompra =
        productoDTO.PrecioCompra;

    producto.PrecioVenta =
        productoDTO.PrecioVenta;

    producto.Descripcion =
        productoDTO.Descripcion;

    producto.Stock =
        productoDTO.Stock;

    producto.Bodega =
        productoDTO.Bodega?.Trim();

    producto.Estanteria =
        productoDTO.Estanteria?.Trim();

    producto.Fila =
        productoDTO.Fila?.Trim();

    producto.Estado =
        productoDTO.Estado;


    // ==================================================
    // PROCESAR NUEVA IMAGEN
    // ==================================================

    if (productoDTO.Imagen != null)
    {
        var carpetaImagenes =
            Path.Combine(
                _environment.WebRootPath,
                "images"
            );


        if (!Directory.Exists(carpetaImagenes))
        {
            Directory.CreateDirectory(
                carpetaImagenes
            );
        }


        // ----------------------------------------------
        // GUARDAR RUTA DE LA IMAGEN ANTERIOR
        // ----------------------------------------------

        var imagenAnterior =
            producto.Imagen;


        // ----------------------------------------------
        // OBTENER EXTENSIÓN
        // ----------------------------------------------

        var extension =
            Path.GetExtension(
                productoDTO.Imagen.FileName
            ).ToLowerInvariant();


        // ----------------------------------------------
        // GENERAR NOMBRE ÚNICO
        // ----------------------------------------------

        var nombreArchivo =
            $"{Guid.NewGuid()}{extension}";


        var rutaFisica =
            Path.Combine(
                carpetaImagenes,
                nombreArchivo
            );


        // ----------------------------------------------
        // GUARDAR NUEVA IMAGEN
        // ----------------------------------------------

        using var stream =
            new FileStream(
                rutaFisica,
                FileMode.Create
            );


        await productoDTO.Imagen.CopyToAsync(
            stream
        );


        // ----------------------------------------------
        // GUARDAR RUTA EN SQL
        // ----------------------------------------------

        producto.Imagen =
            $"/images/{nombreArchivo}";


        // ----------------------------------------------
        // ELIMINAR IMAGEN ANTERIOR
        // ----------------------------------------------

        if (!string.IsNullOrEmpty(imagenAnterior))
        {
            var rutaImagenAnterior =
                Path.Combine(
                    _environment.WebRootPath,
                    imagenAnterior.TrimStart('/')
                );


            if (System.IO.File.Exists(
                rutaImagenAnterior))
            {
                System.IO.File.Delete(
                    rutaImagenAnterior
                );
            }
        }
    }


    // ==================================================
    // GUARDAR CAMBIOS
    // ==================================================

    await _context.SaveChangesAsync();


    return Ok(new
    {
        mensaje = "Producto actualizado correctamente",
        producto = producto
    });
}       

        [HttpPost]
        public async Task<IActionResult> CrearProducto(
            [FromForm] CrearProductoDTO productoDTO)
        {

                if (productoDTO.PrecioVenta < productoDTO.PrecioCompra)
            {
                return BadRequest(new
                {
                    mensaje = "El precio de venta no puede ser menor que el precio de compra."
                });
            }


            var codigoExiste = await _context.Productos
            .AnyAsync(p => p.CodigoBarras == productoDTO.CodigoBarras);

                if (codigoExiste)
            {
               return Conflict(new
              {
                    mensaje = "Ya existe un producto con ese código de barras."
              });
            }



                string? rutaImagen = null;

            if (productoDTO.Imagen != null)
            {
                var carpetaImagenes =
                    Path.Combine(
                        _environment.WebRootPath,
                        "images"
                    );

             if (!Directory.Exists(carpetaImagenes))
                {
                Directory.CreateDirectory(carpetaImagenes);
                }

                var extension =
                Path.GetExtension(
                    productoDTO.Imagen.FileName
                ).ToLowerInvariant();

                var nombreArchivo =
                $"{Guid.NewGuid()}{extension}";

                var rutaFisica =
                    Path.Combine(
                    carpetaImagenes,
                    nombreArchivo
                );

            using var stream =
                new FileStream(
                    rutaFisica,
                    FileMode.Create
                );

            await productoDTO.Imagen.CopyToAsync(stream);

            rutaImagen =
                $"/images/{nombreArchivo}";
        }



            var producto = new Producto
            {
                CodigoBarras = productoDTO.CodigoBarras,
                Nombre = productoDTO.Nombre,
                IdCategoria = productoDTO.IdCategoria,
                PrecioCompra = productoDTO.PrecioCompra,
                PrecioVenta = productoDTO.PrecioVenta,
                Descripcion = productoDTO.Descripcion,
                Imagen = rutaImagen,
                Stock = productoDTO.Stock,
                Bodega = productoDTO.Bodega?.Trim(),
                Estanteria = productoDTO.Estanteria?.Trim(),
                Fila = productoDTO.Fila?.Trim(),
                Estado = true
            };

            _context.Productos.Add(producto);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ObtenerProductos),
                new { id = producto.IdProducto },
                producto
            );
        }


   


        [HttpDelete("{id}")]
public async Task<IActionResult> EliminarProducto(int id)
{
    var producto = await _context.Productos
        .FirstOrDefaultAsync(p => p.IdProducto == id);

    if (producto == null)
    {
        return NotFound(new
        {
            mensaje = "Producto no encontrado"
        });
    }

    producto.Estado = false;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        mensaje = "Producto desactivado correctamente"
    });
}

[HttpPut("reactivar/{id}")]
public async Task<IActionResult> ReactivarProducto(int id)
{
    var producto = await _context.Productos
        .FirstOrDefaultAsync(p => p.IdProducto == id);

    if (producto == null)
    {
        return NotFound(new
        {
            mensaje = "Producto no encontrado"
        });
    }

    if (producto.Estado)
    {
        return BadRequest(new
        {
            mensaje = "El producto ya está activo."
        });
    }

    producto.Estado = true;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        mensaje = "Producto reactivado correctamente"
    });
}


[HttpGet("desactivados")]
public async Task<IActionResult> ObtenerProductosDesactivados()
{
    var productos = await _context.Productos
        .Where(p => !p.Estado)
        .Include(p => p.Categoria)
        .Select(p => new ProductoDTO
        {
            IdProducto = p.IdProducto,
            CodigoBarras = p.CodigoBarras,
            Nombre = p.Nombre,
            IdCategoria = p.IdCategoria,
            Categoria = p.Categoria != null
                ? p.Categoria.Nombre
                : "",
            PrecioCompra = p.PrecioCompra,
            PrecioVenta = p.PrecioVenta,
            Descripcion = p.Descripcion,
            Imagen = p.Imagen,
            Stock = p.Stock,
            Bodega = p.Bodega,
            Estanteria = p.Estanteria,
            Fila = p.Fila,
            FechaRegistro = p.FechaRegistro,
            Estado = p.Estado
        })
        .ToListAsync();

    return Ok(productos);
}




    }
}
