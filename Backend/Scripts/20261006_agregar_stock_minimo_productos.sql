IF COL_LENGTH('dbo.Productos', 'StockMinimo') IS NULL
BEGIN
    ALTER TABLE dbo.Productos
    ADD StockMinimo INT NOT NULL
        CONSTRAINT DF_Productos_StockMinimo DEFAULT (5);
END;
