ALTER TABLE DetallesVenta ADD CostoUnitario DECIMAL(10,2) NOT NULL CONSTRAINT DF_DetallesVenta_CostoUnitario DEFAULT 0;

-- Para ventas existentes se usa el costo actual como aproximacion inicial.
UPDATE detalle
SET CostoUnitario = producto.PrecioCompra
FROM DetallesVenta detalle
INNER JOIN Productos producto ON producto.IdProducto = detalle.IdProducto;
