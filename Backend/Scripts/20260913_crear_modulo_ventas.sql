CREATE TABLE Ventas (
    IdVenta INT IDENTITY(1,1) PRIMARY KEY,
    Vehiculo NVARCHAR(100) NOT NULL,
    Placa NVARCHAR(20) NULL,
    Observaciones NVARCHAR(500) NULL,
    Estado NVARCHAR(20) NOT NULL,
    FechaApertura DATETIME2 NOT NULL,
    FechaCierre DATETIME2 NULL,
    Total DECIMAL(10,2) NOT NULL DEFAULT 0
);
CREATE INDEX IX_Ventas_Estado ON Ventas(Estado);

CREATE TABLE DetallesVenta (
    IdDetalleVenta INT IDENTITY(1,1) PRIMARY KEY,
    IdVenta INT NOT NULL,
    IdProducto INT NOT NULL,
    NombreProducto NVARCHAR(150) NOT NULL,
    CodigoBarras NVARCHAR(50) NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_DetallesVenta_Ventas FOREIGN KEY (IdVenta) REFERENCES Ventas(IdVenta) ON DELETE CASCADE,
    CONSTRAINT FK_DetallesVenta_Productos FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
);

CREATE TABLE MovimientosInventario (
    IdMovimientoInventario INT IDENTITY(1,1) PRIMARY KEY,
    IdProducto INT NOT NULL,
    IdVenta INT NULL,
    Tipo NVARCHAR(30) NOT NULL,
    Cantidad INT NOT NULL,
    StockAnterior INT NOT NULL,
    StockPosterior INT NOT NULL,
    Fecha DATETIME2 NOT NULL,
    Descripcion NVARCHAR(250) NULL,
    CONSTRAINT FK_MovimientosInventario_Productos FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto),
    CONSTRAINT FK_MovimientosInventario_Ventas FOREIGN KEY (IdVenta) REFERENCES Ventas(IdVenta)
);
