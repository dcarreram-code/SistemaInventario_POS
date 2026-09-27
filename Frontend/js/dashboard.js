const formatoMonedaDashboard = new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ"
});

function agregarFilaDashboard(contenedor, elementos, clase = "fila-dashboard") {
    const fila = document.createElement("div");
    fila.className = clase;
    elementos.forEach(elemento => fila.appendChild(elemento));
    contenedor.appendChild(fila);
}

function crearTextoDashboard(etiqueta, texto, clase = "") {
    const elemento = document.createElement(etiqueta);
    elemento.textContent = texto;
    if (clase) elemento.className = clase;
    return elemento;
}

function mostrarProductosMasVendidos(productos) {
    const contenedor = document.getElementById("dashboardMasVendidos");
    contenedor.replaceChildren();

    if (!productos.length) {
        contenedor.appendChild(crearTextoDashboard(
            "p",
            "Todavía no hay productos vendidos.",
            "estado-vacio-dashboard"
        ));
        return;
    }

    productos.forEach((producto, indice) => {
        agregarFilaDashboard(contenedor, [
            crearTextoDashboard("span", `${indice + 1}.`, "posicion-dashboard"),
            crearTextoDashboard("strong", producto.nombre),
            crearTextoDashboard("span", `${producto.cantidadVendida} vendido(s)`, "dato-dashboard")
        ]);
    });
}

function mostrarProductosStockBajo(productos) {
    const contenedor = document.getElementById("dashboardStockBajo");
    contenedor.replaceChildren();

    if (!productos.length) {
        contenedor.appendChild(crearTextoDashboard(
            "p",
            "No hay productos activos con stock de 5 o menos.",
            "estado-vacio-dashboard"
        ));
        return;
    }

    productos.forEach(producto => {
        agregarFilaDashboard(contenedor, [
            crearTextoDashboard("strong", producto.nombre),
            crearTextoDashboard("span", `${producto.stock} disponible(s)`, "stock-bajo-dashboard")
        ]);
    });
}

function mostrarUltimasVentas(ventas) {
    const contenedor = document.getElementById("dashboardVentasRecientes");
    contenedor.replaceChildren();

    if (!ventas.length) {
        contenedor.appendChild(crearTextoDashboard(
            "p",
            "Todavía no hay ventas registradas.",
            "estado-vacio-dashboard"
        ));
        return;
    }

    ventas.forEach(venta => {
        const informacion = document.createElement("div");
        informacion.className = "informacion-venta-dashboard";
        informacion.appendChild(crearTextoDashboard(
            "strong",
            `#${venta.idVenta} · ${venta.vehiculo}${venta.placa ? ` · ${venta.placa}` : ""}`
        ));
        informacion.appendChild(crearTextoDashboard(
            "span",
            `${new Date(venta.fecha).toLocaleString("es-GT")} · ${venta.cantidadProductos} producto(s)`
        ));

        const resumen = document.createElement("div");
        resumen.className = "resumen-venta-dashboard";
        const estado = crearTextoDashboard("span", venta.estado, "estado-venta-dashboard");
        const clasesEstado = {
            Abierta: "abierta",
            PendientePago: "pendiente",
            Completada: "completada",
            Anulada: "anulada",
            Cancelada: "cancelada"
        };
        estado.classList.add(clasesEstado[venta.estado] || "otro");
        resumen.append(
            estado,
            crearTextoDashboard("strong", formatoMonedaDashboard.format(Number(venta.total)))
        );

        agregarFilaDashboard(
            contenedor,
            [informacion, resumen],
            "fila-dashboard fila-venta-dashboard"
        );
    });
}

async function cargarDashboard() {
    const boton = document.getElementById("btnActualizarDashboard");
    const mensajeError = document.getElementById("errorDashboard");
    boton.disabled = true;
    mensajeError.hidden = true;
    boton.setAttribute("aria-busy", "true");

    try {
        const datos = await respuestaVenta("/dashboard");
        const resumen = datos.resumen;
        const indicadores = {
            productosActivos: resumen.productosActivos,
            ventasHoy: resumen.ventasHoy,
            ingresosHoy: formatoMonedaDashboard.format(Number(resumen.ingresosHoy)),
            productosStockBajo: resumen.productosStockBajo,
            categoriasActivas: resumen.categoriasActivas,
            ventasAbiertas: resumen.ventasAbiertas,
            ventasPendientes: resumen.ventasPendientes,
            saldoPendiente: formatoMonedaDashboard.format(Number(resumen.saldoPendiente))
        };

        Object.entries(indicadores).forEach(([id, valor]) => {
            document.getElementById(id).textContent = valor.toLocaleString("es-GT");
        });

        document.getElementById("fechaDashboard").textContent =
            new Date().toLocaleDateString("es-GT", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });

        mostrarProductosMasVendidos(datos.productosMasVendidos);
        mostrarProductosStockBajo(datos.productosStockBajo);
        mostrarUltimasVentas(datos.ultimasVentas);
    } catch (error) {
        mensajeError.textContent = `No se pudo cargar el dashboard: ${error.message}`;
        mensajeError.hidden = false;
    } finally {
        boton.disabled = false;
        boton.removeAttribute("aria-busy");
    }
}

document.getElementById("btnActualizarDashboard")
    .addEventListener("click", cargarDashboard);
