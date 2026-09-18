using InventarioAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace InventarioAPI.Data
{
    public class InventarioDbContext : DbContext
    {
        public InventarioDbContext(DbContextOptions<InventarioDbContext> options)
            : base(options)
        {
        }

        public DbSet<Categoria> Categorias { get; set; }

        public DbSet<Producto> Productos { get; set; }

        public DbSet<Equivalencia> Equivalencias { get; set; }

        public DbSet<Venta> Ventas { get; set; }

        public DbSet<DetalleVenta> DetallesVenta { get; set; }

        public DbSet<MovimientoInventario> MovimientosInventario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("Categorias");

                entity.HasKey(c => c.IdCategoria);

                entity.Property(c => c.Nombre)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(c => c.Descripcion)
                    .HasMaxLength(250);
            });

            modelBuilder.Entity<Producto>(entity =>
            {
                entity.ToTable("Productos");

                entity.HasKey(p => p.IdProducto);

                entity.Property(p => p.CodigoBarras)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(p => p.CodigoBarras)
                    .IsUnique();

                entity.Property(p => p.Nombre)
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(p => p.PrecioCompra)
                    .HasPrecision(10, 2);

                entity.Property(p => p.PrecioVenta)
                    .HasPrecision(10, 2);

                entity.Property(p => p.Descripcion)
                    .HasMaxLength(500);

                entity.Property(p => p.Bodega)
                    .HasMaxLength(50);

                entity.Property(p => p.Estanteria)
                    .HasMaxLength(50);

                entity.Property(p => p.Fila)
                    .HasMaxLength(50);

                entity.Property(p => p.FechaRegistro)
                    .HasDefaultValueSql("GETDATE()");

                entity.Property(p => p.Imagen)
                    .HasMaxLength(500);

                entity.HasOne(p => p.Categoria)
                    .WithMany(c => c.Productos)
                    .HasForeignKey(p => p.IdCategoria)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Equivalencia>(entity =>
            {
                entity.ToTable("Equivalencias");

                entity.HasKey(e => e.IdEquivalencia);

                entity.Property(e => e.Marca)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(e => e.Codigo)
                    .HasMaxLength(100)
                    .IsRequired();

                entity.HasOne(e => e.Producto)
                    .WithMany(p => p.Equivalencias)
                    .HasForeignKey(e => e.IdProducto)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new
                {
                    e.IdProducto,
                    e.Marca,
                    e.Codigo
                })
                .IsUnique();
            });

            modelBuilder.Entity<Equivalencia>()
                .HasIndex(e => new
                {
                    e.IdProducto,
                    e.Marca,
                    e.Codigo
                })
                .IsUnique();            

            modelBuilder.Entity<Venta>(entity =>
            {
                entity.ToTable("Ventas");
                entity.HasKey(v => v.IdVenta);
                entity.Property(v => v.Vehiculo).HasMaxLength(100).IsRequired();
                entity.Property(v => v.Placa).HasMaxLength(20);
                entity.Property(v => v.Observaciones).HasMaxLength(500);
                entity.Property(v => v.Estado).HasMaxLength(20).IsRequired();
                entity.Property(v => v.Total).HasPrecision(10, 2);
                entity.HasIndex(v => v.Estado);
            });

            modelBuilder.Entity<DetalleVenta>(entity =>
            {
                entity.ToTable("DetallesVenta");
                entity.HasKey(d => d.IdDetalleVenta);
                entity.Property(d => d.NombreProducto).HasMaxLength(150).IsRequired();
                entity.Property(d => d.CodigoBarras).HasMaxLength(50).IsRequired();
                entity.Property(d => d.PrecioUnitario).HasPrecision(10, 2);
                entity.Property(d => d.CostoUnitario).HasPrecision(10, 2);
                entity.Property(d => d.Subtotal).HasPrecision(10, 2);
                entity.HasOne(d => d.Venta).WithMany(v => v.Detalles).HasForeignKey(d => d.IdVenta).OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(d => d.Producto).WithMany().HasForeignKey(d => d.IdProducto).OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<MovimientoInventario>(entity =>
            {
                entity.ToTable("MovimientosInventario");
                entity.HasKey(m => m.IdMovimientoInventario);
                entity.Property(m => m.Tipo).HasMaxLength(30).IsRequired();
                entity.Property(m => m.Descripcion).HasMaxLength(250);
                entity.HasOne(m => m.Producto).WithMany().HasForeignKey(m => m.IdProducto).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(m => m.Venta).WithMany(v => v.Movimientos).HasForeignKey(m => m.IdVenta).OnDelete(DeleteBehavior.Restrict);
            });


            
        }
    }
}
