const modalMovimientosInventario = document.getElementById("modalMovimientosInventario");
const formMovimientoInventario = document.getElementById("formMovimientoInventario");
const movimientoProducto = document.getElementById("movimientoProducto");
const movimientoIdProducto = document.getElementById("movimientoIdProducto");
const resultadosProductosMovimiento = document.getElementById("resultadosProductosMovimiento");
const movimientoTipo = document.getElementById("movimientoTipo");
const movimientoCantidad = document.getElementById("movimientoCantidad");
const movimientoDireccionAjuste = document.getElementById("movimientoDireccionAjuste");
const movimientoDescripcion = document.getElementById("movimientoDescripcion");
const campoDireccionAjuste = document.getElementById("campoDireccionAjuste");
const filtroMovimientoProducto = document.getElementById("filtroMovimientoProducto");
const filtroMovimientoIdProducto = document.getElementById("filtroMovimientoIdProducto");
const resultadosFiltroProductoMovimiento = document.getElementById("resultadosFiltroProductoMovimiento");
const filtroMovimientoTipo = document.getElementById("filtroMovimientoTipo");
const filtroMovimientoDesde = document.getElementById("filtroMovimientoDesde");
const filtroMovimientoHasta = document.getElementById("filtroMovimientoHasta");
const listaMovimientosInventario = document.getElementById("listaMovimientosInventario");

function escaparHtml(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[caracter]);
}

async function respuestaMovimientos(url, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${url}`, opciones);
    if (!respuesta.ok) {
        const error = await respuesta.json();
        throw new Error(error.mensaje || "No se pudo completar la operación.");
    }
    return respuesta.json();
}

function configurarBusquedaProducto(input, idProducto, resultados, mostrarStock) {
    let temporizador;
    let consultaActual = 0;
    const productos = new Map();

    input.addEventListener("input", () => {
        idProducto.value = "";
        clearTimeout(temporizador);
        const termino = input.value.trim();
        const consulta = ++consultaActual;

        if (termino.length < 2) {
            resultados.innerHTML = termino
                ? `<p class="sin-sugerencias-producto">Escriba al menos 2 caracteres.</p>`
                : "";
            return;
        }

        resultados.innerHTML = `<p class="sin-sugerencias-producto">Buscando productos...</p>`;
        temporizador = setTimeout(async () => {
            try {
                const encontrados = await respuestaMovimientos(
                    `/productos/buscar?termino=${encodeURIComponent(termino)}`
                );
                if (consulta !== consultaActual) return;

                const opciones = encontrados.slice(0, 10);
                productos.clear();
                opciones.forEach(producto => productos.set(String(producto.idProducto), producto));
                resultados.innerHTML = opciones.length
                    ? opciones.map(producto => `
                        <button type="button" data-producto="${producto.idProducto}">
                            <strong>${escaparHtml(producto.nombre)}</strong>
                            <span>Código: ${escaparHtml(producto.codigoBarras)}${mostrarStock ? ` · Stock: ${producto.stock}` : ""}</span>
                        </button>
                    `).join("")
                    : `<p class="sin-sugerencias-producto">No se encontraron productos.</p>`;
            } catch (error) {
                if (consulta !== consultaActual) return;
                console.error("Error buscando productos:", error);
                resultados.innerHTML = `<p class="sin-sugerencias-producto">No se pudieron buscar productos.</p>`;
            }
        }, 250);
    });

    resultados.addEventListener("click", evento => {
        const boton = evento.target.closest("button[data-producto]");
        if (!boton) return;

        const producto = productos.get(boton.dataset.producto);
        if (!producto) return;

        idProducto.value = producto.idProducto;
        input.value = `${producto.nombre} (${producto.codigoBarras})${mostrarStock ? ` — Stock: ${producto.stock}` : ""}`;
        resultados.innerHTML = "";
    });

    input.addEventListener("keydown", evento => {
        if (evento.key === "Escape") resultados.innerHTML = "";
    });
}

function formatoTipoMovimiento(movimiento) {
    if (movimiento.tipo === "AnulacionVenta") return "Anulación de venta";
    if (movimiento.tipo === "Venta") return "Venta";
    if (movimiento.idVenta) return `${escaparHtml(movimiento.tipo)} (Venta #${movimiento.idVenta})`;
    return escaparHtml(movimiento.tipo);
}

async function cargarHistorialMovimientos() {
    const parametros = new URLSearchParams();
    if (filtroMovimientoIdProducto.value) parametros.set("idProducto", filtroMovimientoIdProducto.value);
    if (filtroMovimientoTipo.value) parametros.set("tipo", filtroMovimientoTipo.value);
    if (filtroMovimientoDesde.value) parametros.set("desde", filtroMovimientoDesde.value);
    if (filtroMovimientoHasta.value) parametros.set("hasta", filtroMovimientoHasta.value);

    const consulta = parametros.toString();
    const query = consulta ? `?${consulta}` : "";
    const movimientos = await respuestaMovimientos(`/movimientos${query}`);

    if (movimientos.length === 0) {
        listaMovimientosInventario.innerHTML = `<tr><td colspan="7">No hay movimientos para los filtros seleccionados.</td></tr>`;
        return;
    }

    listaMovimientosInventario.innerHTML = movimientos.map(movimiento => {
        const cantidad = Number(movimiento.cantidad);
        const cantidadMostrada = `${cantidad > 0 ? "+" : ""}${cantidad}`;
        const fecha = new Date(movimiento.fecha).toLocaleString("es-GT");
        return `
            <tr>
                <td>${escaparHtml(fecha)}</td>
                <td>${escaparHtml(movimiento.producto)}</td>
                <td>${formatoTipoMovimiento(movimiento)}</td>
                <td>${movimiento.stockAnterior}</td>
                <td class="${cantidad < 0 ? "cantidad-negativa" : "cantidad-positiva"}">${cantidadMostrada}</td>
                <td>${movimiento.stockPosterior}</td>
                <td>${escaparHtml(movimiento.descripcion || "—")}</td>
            </tr>
        `;
    }).join("");
}

document.getElementById("btnMovimientosInventario").addEventListener("click", async () => {
    modalMovimientosInventario.classList.add("activo");
    try {
        await cargarHistorialMovimientos();
    } catch (error) {
        console.error("Error cargando movimientos de inventario:", error);
        listaMovimientosInventario.innerHTML = `<tr><td colspan="7">No se pudo cargar el historial de movimientos.</td></tr>`;
        alert(error.message);
    }
});

configurarBusquedaProducto(
    movimientoProducto,
    movimientoIdProducto,
    resultadosProductosMovimiento,
    true
);
configurarBusquedaProducto(
    filtroMovimientoProducto,
    filtroMovimientoIdProducto,
    resultadosFiltroProductoMovimiento,
    false
);

document.getElementById("btnCerrarMovimientosInventario").addEventListener("click", () => {
    modalMovimientosInventario.classList.remove("activo");
});

movimientoTipo.addEventListener("change", () => {
    const esAjuste = movimientoTipo.value === "Ajuste";
    campoDireccionAjuste.style.display = esAjuste ? "" : "none";
    movimientoDireccionAjuste.required = esAjuste;
});

formMovimientoInventario.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (!movimientoIdProducto.value) {
        alert("Busque y seleccione un producto de la lista.");
        movimientoProducto.focus();
        return;
    }
    const cantidad = Number(movimientoCantidad.value);
    if (!Number.isInteger(cantidad) || cantidad < 1) {
        alert("La cantidad debe ser un entero mayor que cero.");
        return;
    }

    const datos = {
        idProducto: Number(movimientoIdProducto.value),
        tipo: movimientoTipo.value,
        cantidad,
        direccionAjuste: movimientoTipo.value === "Ajuste" ? movimientoDireccionAjuste.value : null,
        descripcion: movimientoDescripcion.value.trim()
    };

    try {
        const resultado = await respuestaMovimientos("/movimientos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });
        alert(`Movimiento registrado. Stock resultante: ${resultado.stockPosterior}.`);
        formMovimientoInventario.reset();
        resultadosProductosMovimiento.innerHTML = "";
        campoDireccionAjuste.style.display = "none";
        movimientoDireccionAjuste.required = false;
        await Promise.all([cargarHistorialMovimientos(), cargarProductos()]);
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("filtrosMovimientos").addEventListener("submit", async evento => {
    evento.preventDefault();
    if (filtroMovimientoProducto.value.trim() && !filtroMovimientoIdProducto.value) {
        alert("Seleccione un producto de la lista de resultados o borre la búsqueda.");
        filtroMovimientoProducto.focus();
        return;
    }
    if (filtroMovimientoDesde.value && filtroMovimientoHasta.value &&
        filtroMovimientoHasta.value < filtroMovimientoDesde.value) {
        alert("La fecha final no puede ser anterior a la inicial.");
        return;
    }
    try {
        await cargarHistorialMovimientos();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("btnLimpiarFiltrosMovimientos").addEventListener("click", async () => {
    filtroMovimientoProducto.value = "";
    filtroMovimientoIdProducto.value = "";
    resultadosFiltroProductoMovimiento.innerHTML = "";
    filtroMovimientoTipo.value = "";
    filtroMovimientoDesde.value = "";
    filtroMovimientoHasta.value = "";
    try {
        await cargarHistorialMovimientos();
    } catch (error) {
        alert(error.message);
    }
});
