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

function crearBadgeRanking(indice) {
    const badge = document.createElement("span");
    badge.className = `ranking-dashboard ranking-${indice + 1}`;
    badge.textContent = String(indice + 1).padStart(2, "0");
    return badge;
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
        const detalle = document.createElement("div");
        detalle.className = "detalle-ranking-dashboard";
        detalle.appendChild(crearTextoDashboard(
            "strong",
            producto.nombre
        ));
        detalle.appendChild(crearTextoDashboard(
            "span",
            `${producto.cantidadVendida} ${Number(producto.cantidadVendida) === 1 ? "unidad" : "unidades"}`
        ));

        agregarFilaDashboard(contenedor, [
            crearBadgeRanking(indice),
            detalle
        ], "fila-dashboard fila-ranking-dashboard");
    });
}

function mostrarProductosStockBajo(productos) {
    const contenedor = document.getElementById("dashboardStockBajo");
    contenedor.replaceChildren();

    if (!productos.length) {
        const vacio = document.createElement("div");
        vacio.className = "estado-stock-ok";
        vacio.innerHTML = "<strong>Inventario estable</strong><span>No hay productos con stock de 5 o menos.</span>";
        contenedor.appendChild(vacio);
        return;
    }

    productos.forEach(producto => {
        const stock = Number(producto.stock);
        const severidad = stock <= 2 ? "critico" : stock <= 5 ? "alerta" : "normal";

        const detalle = document.createElement("div");
        detalle.className = "detalle-stock-dashboard";
        detalle.appendChild(crearTextoDashboard("strong", producto.nombre));
        if (producto.codigoBarras) {
            detalle.appendChild(crearTextoDashboard("span", producto.codigoBarras));
        }

        const badge = crearTextoDashboard(
            "span",
            `${stock} ${stock === 1 ? "unidad" : "unidades"}`,
            `stock-bajo-dashboard ${severidad}`
        );

        agregarFilaDashboard(
            contenedor,
            [detalle, badge],
            "fila-dashboard fila-stock-dashboard"
        );
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

        const titulo = document.createElement("div");
        titulo.className = "titulo-venta-dashboard";
        titulo.appendChild(crearTextoDashboard("strong", `Venta #${venta.idVenta}`));
        titulo.appendChild(crearTextoDashboard("span", venta.vehiculo || "Sin vehículo"));

        informacion.appendChild(titulo);
        informacion.appendChild(crearTextoDashboard(
            "span",
            `${new Date(venta.fecha).toLocaleString("es-GT", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })} · ${venta.cantidadProductos} ${venta.cantidadProductos === 1 ? "producto" : "productos"}${venta.placa ? ` · ${venta.placa}` : ""}`
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
            crearTextoDashboard(
                "strong",
                formatoMonedaDashboard.format(Number(venta.total))
            )
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
