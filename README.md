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
- Gestión de clientes con historial de ventas y saldos pendientes


"Que nos hace falta"

- Usuarios, Contraseñas y Permisos


## Módulo de clientes

Antes de usar el módulo por primera vez, ejecutar `Backend/Scripts/20261006_crear_modulo_clientes.sql`
en la base de datos. El script crea la tabla y la relación opcional con ventas, y asocia
los clientes identificados en ventas anteriores a partir de su nombre y teléfono.

Desde la aplicación se pueden registrar, buscar, editar, desactivar y reactivar clientes,
consultar su historial y ver el saldo acumulado de sus ventas pendientes. Al iniciar una
venta o guardar una venta al crédito se puede seleccionar un cliente existente; si tiene
cuentas pendientes, se muestra el saldo antes de continuar.
