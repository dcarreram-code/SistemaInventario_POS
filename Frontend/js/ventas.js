const modalVentas = document.getElementById("modalVentas");
const listaVentasAbiertas = document.getElementById("listaVentasAbiertas");
const formNuevaVenta = document.getElementById("formNuevaVenta");
const contenidoVenta = document.getElementById("contenidoVenta");
const detallesVenta = document.getElementById("detallesVenta");
const resultadosProductosVenta = document.getElementById("resultadosProductosVenta");
const ventaVehiculo = document.getElementById("ventaVehiculo");
const ventaPlaca = document.getElementById("ventaPlaca");
const ventaObservaciones = document.getElementById("ventaObservaciones");
let ventaActual = null;
let temporizadorBusquedaVenta = null;
let mostrandoHistorial = false;

async function respuestaVenta(url, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${url}`, opciones);
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            datos.title ||
            `No se pudo completar la operacion (HTTP ${respuesta.status}).`
        );
    }
    return datos;
}

async function cargarVentasAbiertas() {
    const ventas = await respuestaVenta("/ventas/abiertas");
    listaVentasAbiertas.innerHTML = ventas.length ? "" : "<p>No hay cuentas abiertas.</p>";
    ventas.forEach(venta => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "tarjeta-venta";
        boton.dataset.id = venta.idVenta;
        boton.innerHTML = `<strong>${venta.vehiculo}</strong><span>${venta.placa || "Sin placa"}</span><small>${venta.cantidadProductos} producto(s) · Q${Number(venta.total).toFixed(2)}</small>`;
        listaVentasAbiertas.appendChild(boton);
    });
}

async function cargarHistorialVentas() {
    const desde = document.getElementById("historialDesde");
    const hasta = document.getElementById("historialHasta");
    const busqueda = document.getElementById("historialBusqueda");
    const parametros = new URLSearchParams();

    if (desde?.value) parametros.set("desde", desde.value);
    if (hasta?.value) parametros.set("hasta", hasta.value);
    if (busqueda?.value.trim()) parametros.set("vehiculo", busqueda.value.trim());

    const query = parametros.toString();
    const ventas = await respuestaVenta(
        `/ventas/historial${query ? `?${query}` : ""}`
    );

    listaVentasAbiertas.innerHTML = "";

    if (!ventas.length) {
        listaVentasAbiertas.innerHTML = `
            <div class="historial-vacio">
                <strong>No se encontraron ventas</strong>
                <span>Prueba con otro rango de fechas o vehículo/placa.</span>
            </div>`;
        return;
    }

    const grupos = {};

    ventas.forEach(venta => {
        const fecha = venta.fechaCierre
            ? new Date(venta.fechaCierre)
            : null;

        const clave = fecha
            ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
            : "sin-fecha";

        if (!grupos[clave]) grupos[clave] = [];
        grupos[clave].push(venta);
    });

    Object.keys(grupos).sort().reverse().forEach(clave => {
        const ventasMes = grupos[clave];

        const grupo = document.createElement("section");
        grupo.className = "grupo-historial";

        let tituloMes = "Sin fecha";

        if (clave !== "sin-fecha") {
            const [anio, mes] = clave.split("-").map(Number);

            tituloMes = new Date(anio, mes - 1, 1)
                .toLocaleDateString("es-GT", {
                    month: "long",
                    year: "numeric"
                });

            tituloMes =
                tituloMes.charAt(0).toUpperCase() +
                tituloMes.slice(1);
        }

        const totalMes = ventasMes.reduce(
            (suma, venta) => suma + Number(venta.total || 0),
            0
        );

        const encabezado = document.createElement("div");
        encabezado.className = "encabezado-mes-historial";

        encabezado.innerHTML = `
            <div class="mes-historial-info">
                <strong> ${tituloMes}</strong>
                <span>${ventasMes.length} venta(s)</span>
            </div>

            <strong>Q${totalMes.toFixed(2)}</strong>
        `;

        const listaMes = document.createElement("div");
        listaMes.className = "lista-historial-mes";

        ventasMes.forEach(venta => {
            const boton = document.createElement("button");

            boton.type = "button";
            boton.className = "tarjeta-venta tarjeta-historial";
            boton.dataset.id = venta.idVenta;

            const estado = venta.estado || "Completada";

            if (estado === "Anulada") {
                boton.classList.add("venta-anulada");
            }

            const fecha = venta.fechaCierre
                ? new Date(venta.fechaCierre).toLocaleString("es-GT")
                : "Sin fecha";

            boton.innerHTML = `
                <div class="historial-venta-info">
                    <strong>#${venta.idVenta} · ${venta.vehiculo}</strong>

                    <span>
                        ${venta.placa || "Sin placa"}
                    </span>

                    <span class="estado-venta">
                        ${estado}
                    </span>

                    <small>
                        ${fecha} · ${venta.cantidadProductos} producto(s)
                    </small>
                </div>

                <strong class="historial-venta-total">
                    Q${Number(venta.total || 0).toFixed(2)}
                </strong>
            `;

            listaMes.appendChild(boton);
        });

        grupo.appendChild(encabezado);
        grupo.appendChild(listaMes);
        listaVentasAbiertas.appendChild(grupo);
    });
}

async function abrirVenta(id) {
    ventaActual = await respuestaVenta(`/ventas/${id}`);

    formNuevaVenta.style.display = "none";
    contenidoVenta.style.display = "block";

    document.getElementById("tituloVenta").textContent =
        `${ventaActual.vehiculo}${ventaActual.placa ? ` · ${ventaActual.placa}` : ""}`;

    const esVentaAbierta = ventaActual.estado === "Abierta";
    const esVentaCompletadaEnHistorial =
        mostrandoHistorial && ventaActual.estado === "Completada";

    const accionesVenta = document.querySelector(".acciones-venta");
    const btnVerTicket = document.getElementById("btnVerTicket");
    const btnAnularVenta = document.getElementById("btnAnularVenta");
    const btnCancelarVenta = document.getElementById("btnCancelarVenta");
    const btnConcretarVenta = document.getElementById("btnConcretarVenta");

    document.querySelector(".agregar-producto-venta").style.display =
        esVentaAbierta ? "grid" : "none";

    accionesVenta.style.display =
        (esVentaAbierta || mostrandoHistorial)
            ? "flex"
            : "none";

    btnCancelarVenta.style.display =
        esVentaAbierta ? "inline-flex" : "none";

    btnConcretarVenta.style.display =
        esVentaAbierta ? "inline-flex" : "none";

    btnAnularVenta.style.display =
        esVentaCompletadaEnHistorial ? "inline-flex" : "none";
    btnVerTicket.style.display =
        mostrandoHistorial ? "inline-flex" : "none";

    document.getElementById("tituloModalVentas").textContent =
        mostrandoHistorial ? "Historial de ventas" : "Ventas abiertas";

    mostrarDetallesVenta();

    if (mostrandoHistorial) {
        modalVentas.classList.add("modo-historial");
    } else {
        modalVentas.classList.remove("modo-historial");
        await cargarVentasAbiertas();
    }
}

function mostrarDetallesVenta() {
    const detalles = ventaActual.detalles || [];
    detallesVenta.innerHTML = detalles.length ? "" : "<p>Aun no hay productos en esta cuenta.</p>";
    let total = 0;
    detalles.forEach(detalle => {
        total += Number(detalle.subtotal);
        const fila = document.createElement("div");
        fila.className = "fila-detalle-venta";
        const editable = ventaActual.estado === "Abierta";
        fila.innerHTML = `<div><strong>${detalle.nombreProducto}</strong><span>${detalle.codigoBarras} · Q${Number(detalle.precioUnitario).toFixed(2)}</span></div><input type="number" min="1" value="${detalle.cantidad}" data-detalle="${detalle.idDetalleVenta}" ${editable ? "" : "disabled"}><strong>Q${Number(detalle.subtotal).toFixed(2)}</strong>${editable ? `<button type="button" class="btn-quitar-detalle" data-detalle="${detalle.idDetalleVenta}">×</button>` : ""}`;
        detallesVenta.appendChild(fila);
    });
    document.getElementById("totalVenta").textContent = `Q${total.toFixed(2)}`;
}

function mostrarTicketVenta(venta) {
    const contenidoTicket = document.getElementById("contenidoTicket");
    const fechaVenta = venta.fechaCierre || venta.fechaApertura;
    const fechaFormateada = fechaVenta
        ? new Date(fechaVenta).toLocaleString("es-GT")
        : "Sin fecha";
    const moneda = new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ"
    });
    const detalles = venta.detalles || [];

    contenidoTicket.replaceChildren();

    const aviso = document.createElement("p");
    aviso.className = "aviso-no-facturable";
    aviso.textContent = "Comprobante no facturable";
    contenidoTicket.appendChild(aviso);

    const informacion = document.createElement("dl");
    informacion.className = "informacion-ticket";
    [
        ["Número de venta", `#${venta.idVenta}`],
        ["Fecha y hora", fechaFormateada],
        ["Vehículo", venta.vehiculo],
        ["Placa", venta.placa || "Sin placa"]
    ].forEach(([etiqueta, valor]) => {
        const grupo = document.createElement("div");
        const termino = document.createElement("dt");
        termino.textContent = etiqueta;
        const descripcion = document.createElement("dd");
        descripcion.textContent = valor;
        grupo.append(termino, descripcion);
        informacion.appendChild(grupo);
    });
    contenidoTicket.appendChild(informacion);

    if (venta.estado === "Anulada") {
        const estado = document.createElement("p");
        estado.className = "estado-ticket-anulado";
        estado.textContent = "VENTA ANULADA";
        contenidoTicket.appendChild(estado);
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla-ticket";
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio unit.</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody></tbody>`;

    const cuerpoTabla = tabla.querySelector("tbody");
    detalles.forEach(detalle => {
        const fila = document.createElement("tr");
        [
            detalle.nombreProducto,
            String(detalle.cantidad),
            moneda.format(Number(detalle.precioUnitario)),
            moneda.format(Number(detalle.subtotal))
        ].forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });
        cuerpoTabla.appendChild(fila);
    });
    contenidoTicket.appendChild(tabla);

    const total = document.createElement("p");
    total.className = "total-ticket";
    const etiquetaTotal = document.createElement("span");
    etiquetaTotal.textContent = "TOTAL";
    const valorTotal = document.createElement("strong");
    valorTotal.textContent = moneda.format(Number(venta.total));
    total.append(etiquetaTotal, valorTotal);
    contenidoTicket.appendChild(total);

    document.getElementById("modalTicket").classList.add("activo");
}

document.getElementById("btnVerTicket").addEventListener("click", () => {
    if (ventaActual && mostrandoHistorial) {
        mostrarTicketVenta(ventaActual);
    }
});

function cerrarTicket() {
    document.getElementById("modalTicket").classList.remove("activo");
}

document.getElementById("btnCerrarTicket").addEventListener("click", cerrarTicket);
document.getElementById("btnCerrarTicketAccion").addEventListener("click", cerrarTicket);
window.addEventListener("afterprint", () => {
    document.body.classList.remove("imprimiendo-ticket");
});
document.getElementById("btnImprimirTicket").addEventListener("click", () => {
    document.body.classList.add("imprimiendo-ticket");
    window.print();
});

document.getElementById("btnVentas").addEventListener("click", async () => {
    mostrandoHistorial = false;
    ventaActual = null;

    modalVentas.classList.remove("modo-historial");

    if (filtrosHistorialVentas) {
        filtrosHistorialVentas.style.display = "none";
    }

    contenidoVenta.style.display = "none";
    formNuevaVenta.style.display = "none";

    document.getElementById("tituloModalVentas").textContent = "Ventas abiertas";
    document.getElementById("btnNuevaVenta").style.display = "inline-flex";

    modalVentas.classList.add("activo");

    try {
        await cargarVentasAbiertas();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("btnHistorialVentas").addEventListener("click", async () => {
    mostrandoHistorial = true;
    ventaActual = null;

    modalVentas.classList.add("modo-historial");

    contenidoVenta.style.display = "none";
    formNuevaVenta.style.display = "none";

    document.getElementById("tituloModalVentas").textContent = "Historial de ventas";
    document.getElementById("btnNuevaVenta").style.display = "none";

    if (filtrosHistorialVentas) {
        filtrosHistorialVentas.style.display = "grid";
    }

    modalVentas.classList.add("activo");

    try {
        await cargarHistorialVentas();
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("btnCerrarVentas").addEventListener("click", () => modalVentas.classList.remove("activo"));
document.getElementById("btnNuevaVenta").addEventListener("click", () => {
    mostrandoHistorial = false;
    ventaActual = null;
    contenidoVenta.style.display = "none";
    formNuevaVenta.reset();
    formNuevaVenta.style.display = "grid";
    document.getElementById("ventaVehiculo").focus();
});
listaVentasAbiertas.addEventListener("click", evento => {
    const boton = evento.target.closest(".tarjeta-venta");
    if (boton) abrirVenta(boton.dataset.id).catch(error => alert(error.message));
});
formNuevaVenta.addEventListener("submit", async evento => {
    evento.preventDefault();
    try {
        const venta = await respuestaVenta("/ventas", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehiculo: ventaVehiculo.value.trim(), placa: ventaPlaca.value.trim(), observaciones: ventaObservaciones.value.trim() })
        });
        await abrirVenta(venta.idVenta);
    } catch (error) { alert(error.message); }
});

document.getElementById("buscarProductoVenta").addEventListener("input", function () {
    clearTimeout(temporizadorBusquedaVenta);
    const termino = this.value.trim();
    if (!termino) { resultadosProductosVenta.innerHTML = ""; return; }
    temporizadorBusquedaVenta = setTimeout(async () => {
        try {
            const productos = await respuestaVenta(`/productos/buscar?termino=${encodeURIComponent(termino)}`);
            resultadosProductosVenta.innerHTML = productos.slice(0, 8).map(p => `<button type="button" data-producto="${p.idProducto}"><strong>${p.nombre}</strong> · Stock ${p.stock}</button>`).join("");
        } catch (error) { resultadosProductosVenta.innerHTML = `<p>${error.message}</p>`; }
    }, 250);
});
resultadosProductosVenta.addEventListener("click", async evento => {
    const boton = evento.target.closest("[data-producto]");
    if (!boton || !ventaActual) return;
    const cantidad = Number(document.getElementById("cantidadProductoVenta").value);
    if (!Number.isInteger(cantidad) || cantidad < 1) return alert("La cantidad debe ser al menos 1.");
    try {
        await respuestaVenta(`/ventas/${ventaActual.idVenta}/detalles`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idProducto: Number(boton.dataset.producto), cantidad }) });
        document.getElementById("buscarProductoVenta").value = "";
        resultadosProductosVenta.innerHTML = "";
        await abrirVenta(ventaActual.idVenta);
    } catch (error) { alert(error.message); }
});
detallesVenta.addEventListener("change", async evento => {
    const campo = evento.target.closest("input[data-detalle]");
    if (!campo) return;
    try { await respuestaVenta(`/ventas/${ventaActual.idVenta}/detalles/${campo.dataset.detalle}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cantidad: Number(campo.value) }) }); await abrirVenta(ventaActual.idVenta); } catch (error) { alert(error.message); }
});
detallesVenta.addEventListener("click", async evento => {
    const boton = evento.target.closest(".btn-quitar-detalle");
    if (!boton) return;
    try { await respuestaVenta(`/ventas/${ventaActual.idVenta}/detalles/${boton.dataset.detalle}`, { method: "DELETE" }); await abrirVenta(ventaActual.idVenta); } catch (error) { alert(error.message); }
});
document.getElementById("btnConcretarVenta").addEventListener("click", async () => {
    if (!ventaActual || !confirm("¿Cobrar esta cuenta y descontar el stock?")) return;
    try { const resultado = await respuestaVenta(`/ventas/${ventaActual.idVenta}/concretar`, { method: "POST" }); alert(`${resultado.mensaje} Total: Q${Number(resultado.total).toFixed(2)}`); ventaActual = null; contenidoVenta.style.display = "none"; await cargarVentasAbiertas(); cargarProductos(); } catch (error) { alert(error.message); }
});
document.getElementById("btnCancelarVenta").addEventListener("click", async () => {
    if (!ventaActual || !confirm("¿Cancelar esta cuenta? No afectara el stock.")) return;
    try { await respuestaVenta(`/ventas/${ventaActual.idVenta}/cancelar`, { method: "POST" }); ventaActual = null; contenidoVenta.style.display = "none"; await cargarVentasAbiertas(); } catch (error) { alert(error.message); }
});

document.getElementById("btnAnularVenta").addEventListener("click", async () => {
    if (!ventaActual || ventaActual.estado !== "Completada") return;
    if (!confirm("¿Anular esta venta? El stock de los productos vendidos será devuelto y la venta quedará registrada como anulada.")) return;

    const idVenta = ventaActual.idVenta;

    try {
        const resultado = await respuestaVenta(`/ventas/${idVenta}/anular`, { method: "POST" });
        alert(resultado.mensaje);
        ventaActual = null;
        contenidoVenta.style.display = "none";
        await cargarHistorialVentas();
        cargarProductos();
    } catch (error) {
        alert(error.message);
    }
});

const filtrosHistorialVentas = document.getElementById("filtrosHistorialVentas");
const historialDesde = document.getElementById("historialDesde");
const historialHasta = document.getElementById("historialHasta");
const historialBusqueda = document.getElementById("historialBusqueda");

document.getElementById("btnFiltrarHistorial")?.addEventListener("click", async () => {
    if (historialDesde.value && historialHasta.value && historialHasta.value < historialDesde.value) {
        alert("La fecha final no puede ser anterior a la inicial.");
        return;
    }
    try { await cargarHistorialVentas(); } catch (error) { alert(error.message); }
});

document.getElementById("btnLimpiarHistorial")?.addEventListener("click", async () => {
    historialBusqueda.value = "";
    historialDesde.value = "";
    historialHasta.value = "";
    try { await cargarHistorialVentas(); } catch (error) { alert(error.message); }
});

historialBusqueda?.addEventListener("keydown", evento => {
    if (evento.key === "Enter") {
        evento.preventDefault();
        document.getElementById("btnFiltrarHistorial")?.click();
    }
});

const modalReportesVentas = document.getElementById("modalReportesVentas");
const resultadoReporteVentas = document.getElementById("resultadoReporteVentas");
const formReporteVentas = document.getElementById("formReporteVentas");
const reporteDesde = document.getElementById("reporteDesde");
const reporteHasta = document.getElementById("reporteHasta");

const modalBusquedaVentas = document.getElementById("modalBusquedaVentas");
const resultadosBusquedaVentas = document.getElementById("resultadosBusquedaVentas");
const buscarVentaVehiculo = document.getElementById("buscarVentaVehiculo");

function establecerFechasReporte() {
    const ahora = new Date();
    const yyyy = ahora.getFullYear();
    const mm = String(ahora.getMonth() + 1).padStart(2, "0");
    const dd = String(ahora.getDate()).padStart(2, "0");
    const hoy = `${yyyy}-${mm}-${dd}`;

    if (!reporteHasta.value) reporteHasta.value = hoy;
    if (!reporteDesde.value) reporteDesde.value = `${yyyy}-${mm}-01`;
}

document.getElementById("btnReportesVentas").addEventListener("click", () => {
    establecerFechasReporte();
    resultadoReporteVentas.innerHTML = "";
    modalReportesVentas.classList.add("activo");
});

document.getElementById("btnCerrarReportesVentas").addEventListener("click", () => modalReportesVentas.classList.remove("activo"));

document.getElementById("btnEjecutarBusquedaVentas")?.addEventListener("click", async () => {
    resultadosBusquedaVentas.innerHTML = "";
    modalBusquedaVentas.classList.add("activo");
    try { await buscarVentasRegistradas(); } catch (error) { alert(error.message); }
});

document.getElementById("btnCerrarBusquedaVentas")?.addEventListener("click", () => modalBusquedaVentas.classList.remove("activo"));

formReporteVentas.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (reporteHasta.value < reporteDesde.value) {
        alert("La fecha final no puede ser anterior a la inicial.");
        return;
    }

    try {
        const reporte = await respuestaVenta(`/ventas/reporte?desde=${reporteDesde.value}&hasta=${reporteHasta.value}`);
        const ventas = reporte.ventas || [];

        if (!ventas.length) {
            resultadoReporteVentas.innerHTML = `
                <div class="reporte-vacio">
                    <strong>No hay ventas completadas en este período.</strong>
                    <span>Selecciona otro rango de fechas para consultar las ventas.</span>
                </div>`;
            return;
        }

        const lista = ventas.map(venta => {
            const fecha = venta.fechaCierre ? new Date(venta.fechaCierre).toLocaleString() : "Sin fecha";
            return `
                <div class="fila-reporte-venta">
                    <div class="info-reporte-venta">
                        <strong>#${venta.idVenta} · ${venta.vehiculo}</strong>
                        <span>${venta.placa || "Sin placa"} · ${fecha}</span>
                        <small>${venta.cantidadProductos} producto(s) · Costo Q${Number(venta.costo).toFixed(2)} · Ganancia Q${Number(venta.ganancia).toFixed(2)}</small>
                    </div>
                    <strong class="total-reporte-venta">Q${Number(venta.total).toFixed(2)}</strong>
                </div>`;
        }).join("");

        resultadoReporteVentas.innerHTML = `
            <div class="encabezado-lista-reporte">
                <div>
                    <h3>Ventas del período</h3>
                    <span>${reporte.cantidadVentas} venta(s) encontrada(s)</span>
                </div>
                <span>${reporteDesde.value} al ${reporteHasta.value}</span>
            </div>
            <div class="lista-reporte-ventas">${lista}</div>
            <div class="resumen-reporte">
                <div><span>Ventas</span><strong>${reporte.cantidadVentas}</strong></div>
                <div><span>Productos vendidos</span><strong>${reporte.productosVendidos}</strong></div>
                <div><span>Ingresos</span><strong>Q${Number(reporte.ingresos).toFixed(2)}</strong></div>
                <div><span>Costos</span><strong>Q${Number(reporte.costos).toFixed(2)}</strong></div>
                <div class="resumen-ganancia"><span>Ganancia</span><strong>Q${Number(reporte.ganancia).toFixed(2)}</strong></div>
            </div>`;
    } catch (error) { alert(error.message); }
});

async function buscarVentasRegistradas() {
    const termino = buscarVentaVehiculo.value.trim();
    const parametros = new URLSearchParams();
    if (termino) parametros.set("vehiculo", termino);

    const ventas = await respuestaVenta(`/ventas/buscar?${parametros}`);
    resultadosBusquedaVentas.innerHTML = ventas.length ? "" : "<p>No se encontraron ventas.</p>";

    ventas.forEach(venta => {
        const fila = document.createElement("button");
        fila.type = "button";
        fila.className = "resultado-venta-busqueda";
        fila.dataset.idVenta = venta.idVenta;
        fila.innerHTML = `
            <div>
                <strong>#${venta.idVenta} · ${venta.vehiculo}</strong>
                <span>${venta.placa || "Sin placa"} · ${venta.estado} · Q${Number(venta.total).toFixed(2)}</span>
            </div>
            <span class="indicador-detalle-venta">Ver detalle →</span>
            `;
        resultadosBusquedaVentas.appendChild(fila);
    });
}

resultadosBusquedaVentas.addEventListener("click", async evento => {
    const fila = evento.target.closest("[data-id-venta]");
    if (!fila) return;

    try {
        const venta = await respuestaVenta(`/ventas/${fila.dataset.idVenta}`);
        mostrarDetalleVentaBuscada(venta);
    } catch (error) {
        alert(error.message);
    }
});

function mostrarDetalleVentaBuscada(venta) {
    const detalles = venta.detalles || [];
    const fecha = venta.fechaCierre ? new Date(venta.fechaCierre).toLocaleString() : "Sin fecha";

    const filas = detalles.length
        ? detalles.map(detalle => `
            <div class="fila-detalle-busqueda">
                <div>
                    <strong>${detalle.nombreProducto}</strong>
                    <span>${detalle.codigoBarras}</span>
                </div>
                <span>${detalle.cantidad} × Q${Number(detalle.precioUnitario).toFixed(2)}</span>
                <strong>Q${Number(detalle.subtotal).toFixed(2)}</strong>
            </div>`).join("")
        : "<p>No hay productos registrados en esta venta.</p>";

    resultadosBusquedaVentas.innerHTML = `
        <div class="detalle-venta-buscada">
            <div class="detalle-busqueda-encabezado">
                <div>
                    <h3>Venta #${venta.idVenta}</h3>
                    <span>${venta.vehiculo}${venta.placa ? ` · ${venta.placa}` : ""}</span>
                    <small>${fecha} · ${venta.estado}</small>
                </div>
                <button type="button" id="btnVolverBusquedaVentas" class="btn-secundario">← Volver</button>
            </div>

            <div class="lista-detalle-busqueda">
                <div class="encabezado-detalle-busqueda">
                    <span>Producto</span>
                    <span>Cantidad × Precio</span>
                    <span>Subtotal</span>
                </div>
                ${filas}
            </div>

            <div class="total-detalle-busqueda">
                <span>Total de la venta</span>
                <strong>Q${Number(venta.total).toFixed(2)}</strong>
            </div>
        </div>`;

    document.getElementById("btnVolverBusquedaVentas").addEventListener("click", () => {
        buscarVentasRegistradas().catch(error => alert(error.message));
    });
}

document.getElementById("btnEjecutarBusquedaVentas").addEventListener("click", () => buscarVentasRegistradas().catch(error => alert(error.message)));
buscarVentaVehiculo.addEventListener("keydown", evento => {
    if (evento.key === "Enter") {
        evento.preventDefault();
        buscarVentasRegistradas().catch(error => alert(error.message));
    }
});
