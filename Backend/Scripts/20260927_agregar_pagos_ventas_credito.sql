IF OBJECT_ID('PagosVenta', 'U') IS NULL
BEGIN
    CREATE TABLE PagosVenta (
        IdPagoVenta INT IDENTITY(1,1) PRIMARY KEY,
        IdVenta INT NOT NULL,
        Monto DECIMAL(10,2) NOT NULL,
        FechaPago DATETIME2 NOT NULL,
        CONSTRAINT CK_PagosVenta_Monto_Positive CHECK (Monto > 0),
        CONSTRAINT FK_PagosVenta_Ventas FOREIGN KEY (IdVenta)
            REFERENCES Ventas(IdVenta) ON DELETE CASCADE
    );

    CREATE INDEX IX_PagosVenta_IdVenta_FechaPago
        ON PagosVenta(IdVenta, FechaPago);
END;
