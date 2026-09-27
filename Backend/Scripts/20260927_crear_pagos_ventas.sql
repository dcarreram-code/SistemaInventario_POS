IF OBJECT_ID(N'PagosVenta', N'U') IS NULL
BEGIN
    CREATE TABLE PagosVenta (
        IdPagoVenta INT IDENTITY(1,1) PRIMARY KEY,
        IdVenta INT NOT NULL,
        Monto DECIMAL(10,2) NOT NULL,
        Fecha DATETIME2 NOT NULL,
        CONSTRAINT CK_PagosVenta_Monto CHECK (Monto > 0),
        CONSTRAINT FK_PagosVenta_Ventas FOREIGN KEY (IdVenta)
            REFERENCES Ventas(IdVenta) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_PagosVenta_IdVenta_Fecha'
      AND object_id = OBJECT_ID(N'PagosVenta')
)
BEGIN
    CREATE INDEX IX_PagosVenta_IdVenta_Fecha
        ON PagosVenta(IdVenta, Fecha);
END;
