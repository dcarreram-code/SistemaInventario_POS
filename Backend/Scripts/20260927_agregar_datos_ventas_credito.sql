IF COL_LENGTH('Ventas', 'NombreCliente') IS NULL
    ALTER TABLE Ventas ADD NombreCliente NVARCHAR(150) NULL;

IF COL_LENGTH('Ventas', 'TelefonoCliente') IS NULL
    ALTER TABLE Ventas ADD TelefonoCliente NVARCHAR(20) NULL;
