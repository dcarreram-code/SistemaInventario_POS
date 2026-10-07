IF OBJECT_ID(N'Clientes', N'U') IS NULL
BEGIN
    CREATE TABLE Clientes (
        IdCliente INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Nombre NVARCHAR(150) NOT NULL,
        Telefono NVARCHAR(20) NOT NULL,
        DpiNit NVARCHAR(30) NULL,
        Direccion NVARCHAR(250) NULL,
        Activo BIT NOT NULL CONSTRAINT DF_Clientes_Activo DEFAULT (1),
        FechaRegistro DATETIME2 NOT NULL CONSTRAINT DF_Clientes_FechaRegistro DEFAULT (GETDATE())
    );
END;

IF COL_LENGTH('Ventas', 'IdCliente') IS NULL
    ALTER TABLE Ventas ADD IdCliente INT NULL;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Clientes_Nombre' AND object_id = OBJECT_ID(N'Clientes')
)
    CREATE INDEX IX_Clientes_Nombre ON Clientes(Nombre);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Clientes_Telefono' AND object_id = OBJECT_ID(N'Clientes')
)
    CREATE INDEX IX_Clientes_Telefono ON Clientes(Telefono);

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_Ventas_IdCliente' AND object_id = OBJECT_ID(N'Ventas')
)
    CREATE INDEX IX_Ventas_IdCliente ON Ventas(IdCliente);

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_Ventas_Clientes_IdCliente'
)
    ALTER TABLE Ventas
        ADD CONSTRAINT FK_Ventas_Clientes_IdCliente
        FOREIGN KEY (IdCliente) REFERENCES Clientes(IdCliente)
        ON DELETE SET NULL;

INSERT INTO Clientes (Nombre, Telefono)
SELECT DISTINCT LTRIM(RTRIM(v.NombreCliente)), LTRIM(RTRIM(v.TelefonoCliente))
FROM Ventas v
WHERE NULLIF(LTRIM(RTRIM(v.NombreCliente)), N'') IS NOT NULL
  AND NULLIF(LTRIM(RTRIM(v.TelefonoCliente)), N'') IS NOT NULL
  AND v.IdCliente IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM Clientes c
      WHERE LTRIM(RTRIM(c.Nombre)) = LTRIM(RTRIM(v.NombreCliente))
        AND LTRIM(RTRIM(c.Telefono)) = LTRIM(RTRIM(v.TelefonoCliente))
  );

UPDATE v
SET v.IdCliente = c.IdCliente
FROM Ventas v
INNER JOIN Clientes c
    ON LTRIM(RTRIM(c.Nombre)) = LTRIM(RTRIM(v.NombreCliente))
   AND LTRIM(RTRIM(c.Telefono)) = LTRIM(RTRIM(v.TelefonoCliente))
WHERE v.IdCliente IS NULL
  AND v.NombreCliente IS NOT NULL
  AND v.TelefonoCliente IS NOT NULL;
