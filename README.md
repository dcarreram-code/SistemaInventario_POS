Proyecto punto de venta con inventario 
trabajado en multilenguajes como la API de conexion a sql en c#, javascript 
para la logica y comportamiento de la aplicacion css para el estilo del programa
 y html para la base de nuestra pagina.


"Que ya esta realizado"


- Productos
- Categorias
- Productos Desactivados
- Categorias Desactivadas
- Modulo Ventas
- Historial de ventas con tickets no facturables e impresion
- Ventas al credito con modulo de pendientes de pago
- Modulo Inventario
- Movimientos e ingresos de inventario
- Dashboard con alertas de stock minimo configurable por producto (5 por defecto)


"Que nos hace falta"


- Modulo de clientes
- Usuarios, Contraseñas y Permisos

Para agregar el stock minimo a la tabla de productos en una base de datos existente,
ejecuta `Backend/Scripts/20261006_agregar_stock_minimo_productos.sql`.

Para habilitar los datos de cliente de las ventas al crédito en una base de datos existente,
ejecuta `Backend/Scripts/20260927_agregar_datos_ventas_credito.sql`.

Para habilitar el registro de pagos y abonos de ventas, ejecuta
`Backend/Scripts/20260927_crear_pagos_ventas.sql` después de crear el módulo de ventas.