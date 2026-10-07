const modalClientes = document.getElementById("modalClientes");
const listaClientes = document.getElementById("listaClientes");
const detalleCliente = document.getElementById("detalleCliente");
const formCliente = document.getElementById("formCliente");
let clienteSeleccionado = null;
let temporizadorBusquedaClientes = null;

async function respuestaCliente(url, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${url}`, opciones);
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje ||
            datos.title ||
            `No se pudo completar la operación (HTTP ${respuesta.status}).`
        );
    }
    return datos;
}

function formatoDineroCliente(valor) {
    return `Q${Number(valor || 0).toFixed(2)}`;
}

async function cargarClientes() {
    const parametros = new URLSearchParams();
    const termino = document.getElementById("buscarCliente").value.trim();
    if (termino) parametros.set("buscar", termino);
    if (document.getElementById("mostrarClientesInactivos").checked) {
        parametros.set("incluirInactivos", "true");
    }

    try {
        const query = parametros.toString();
        const clientes = await respuestaCliente(`/clientes${query ? `?${query}` : ""}`);
        listaClientes.replaceChildren();
        if (!clientes.length) {
            const vacio = document.createElement("p");
            vacio.className = "clientes-vacio";
            vacio.textContent = "No se encontraron clientes.";
            listaClientes.appendChild(vacio);
            return;
        }

        clientes.forEach(cliente => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "tarjeta-cliente";
            boton.classList.toggle("seleccionado", clienteSeleccionado?.idCliente === cliente.idCliente);
            boton.dataset.idCliente = cliente.idCliente;

            const nombre = document.createElement("strong");
            nombre.textContent = cliente.nombre;
            const telefono = document.createElement("span");
            telefono.textContent = cliente.telefono;
            boton.append(nombre, telefono);
            if (!cliente.activo) {
                const estado = document.createElement("small");
                estado.textContent = "Inactivo";
                boton.appendChild(estado);
            } else if (Number(cliente.saldoPendiente) > 0) {
                const deuda = document.createElement("small");
                deuda.className = "saldo-pendiente";
                deuda.textContent = `Pendiente: ${formatoDineroCliente(cliente.saldoPendiente)}`;
                boton.appendChild(deuda);
            }
            listaClientes.appendChild(boton);
        });

        if (clienteSeleccionado && clientes.some(c => c.idCliente === clienteSeleccionado.idCliente)) {
            await mostrarDetalleCliente(clienteSeleccionado.idCliente);
        }
    } catch (error) {
        listaClientes.replaceChildren();
        const mensaje = document.createElement("p");
        mensaje.className = "clientes-error";
        mensaje.textContent = error.message;
        listaClientes.appendChild(mensaje);
    }
}

async function mostrarDetalleCliente(idCliente) {
    const cliente = await respuestaCliente(`/clientes/${idCliente}`);
    clienteSeleccionado = cliente;
    detalleCliente.replaceChildren();

    const encabezado = document.createElement("div");
    encabezado.className = "detalle-cliente-encabezado";
    const titulo = document.createElement("h3");
    titulo.textContent = cliente.nombre;
    const contacto = document.createElement("p");
    contacto.textContent = `Teléfono: ${cliente.telefono}`;
    encabezado.append(titulo, contacto);
    if (cliente.dpiNit) {
        const identificacion = document.createElement("p");
        identificacion.textContent = `DPI/NIT: ${cliente.dpiNit}`;
        encabezado.appendChild(identificacion);
    }
    if (cliente.direccion) {
        const direccion = document.createElement("p");
        direccion.textContent = `Dirección: ${cliente.direccion}`;
        encabezado.appendChild(direccion);
    }
    const estado = document.createElement("span");
    estado.className = cliente.activo ? "estado-cliente activo" : "estado-cliente";
    estado.textContent = cliente.activo ? "Activo" : "Inactivo";
    encabezado.appendChild(estado);

    const saldo = document.createElement("div");
    saldo.className = "saldo-cliente";
    const saldoTitulo = document.createElement("span");
    saldoTitulo.textContent = "Saldo pendiente";
    const saldoMonto = document.createElement("strong");
    saldoMonto.textContent = formatoDineroCliente(cliente.saldoPendiente);
    const saldoCuentas = document.createElement("small");
    saldoCuentas.textContent = `${cliente.cuentasPendientes} cuenta(s) pendiente(s)`;
    saldo.append(saldoTitulo, saldoMonto, saldoCuentas);

    const acciones = document.createElement("div");
    acciones.className = "acciones-cliente";
    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "btn-secundario";
    editar.textContent = "Editar";
    editar.addEventListener("click", () => abrirFormularioCliente(cliente));
    const cambiarEstado = document.createElement("button");
    cambiarEstado.type = "button";
    cambiarEstado.className = cliente.activo ? "btn-desactivar" : "btn-principal";
    cambiarEstado.textContent = cliente.activo ? "Desactivar" : "Reactivar";
    cambiarEstado.addEventListener("click", () => cambiarEstadoCliente(cliente));
    acciones.append(editar, cambiarEstado);

    const tituloHistorial = document.createElement("h4");
    tituloHistorial.textContent = "Historial de compras";
    const historial = document.createElement("div");
    historial.className = "historial-cliente";
    if (!cliente.historial.length) {
        const vacio = document.createElement("p");
        vacio.className = "clientes-vacio";
        vacio.textContent = "Este cliente aún no tiene ventas.";
        historial.appendChild(vacio);
    } else {
        cliente.historial.forEach(venta => {
            const fila = document.createElement("div");
            fila.className = "fila-historial-cliente";
            const informacion = document.createElement("div");
            const numero = document.createElement("strong");
            numero.textContent = `Venta #${venta.idVenta}`;
            const estadoVenta = document.createElement("span");
            estadoVenta.textContent = venta.estado;
            const fecha = document.createElement("small");
            const fechaVenta = venta.fechaCierre || venta.fechaApertura;
            fecha.textContent = fechaVenta
                ? new Date(fechaVenta).toLocaleDateString("es-GT")
                : "Sin fecha";
            informacion.append(numero, estadoVenta, fecha);
            const total = document.createElement("strong");
            total.textContent = formatoDineroCliente(venta.total);
            fila.append(informacion, total);
            if (venta.estado === "PendientePago") {
                const deuda = document.createElement("small");
                deuda.className = "saldo-pendiente";
                deuda.textContent = `Saldo: ${formatoDineroCliente(venta.saldoPendiente)}`;
                fila.appendChild(deuda);
            }
            historial.appendChild(fila);
        });
    }

    detalleCliente.append(encabezado, saldo, acciones, tituloHistorial, historial);
    listaClientes.querySelectorAll(".tarjeta-cliente").forEach(boton => {
        boton.classList.toggle("seleccionado", Number(boton.dataset.idCliente) === cliente.idCliente);
    });
}

function abrirFormularioCliente(cliente = null) {
    clienteSeleccionado = cliente;
    formCliente.reset();
    formCliente.dataset.idCliente = cliente?.idCliente || "";
    document.getElementById("tituloFormularioCliente").textContent =
        cliente ? "Editar cliente" : "Registrar cliente";
    document.getElementById("clienteNombre").value = cliente?.nombre || "";
    document.getElementById("clienteTelefono").value = cliente?.telefono || "";
    document.getElementById("clienteDpiNit").value = cliente?.dpiNit || "";
    document.getElementById("clienteDireccion").value = cliente?.direccion || "";
    formCliente.style.display = "grid";
    document.getElementById("clienteNombre").focus();
}

async function cambiarEstadoCliente(cliente) {
    const accion = cliente.activo ? "desactivar" : "reactivar";
    if (!confirm(`¿Desea ${accion} a ${cliente.nombre}?`)) return;
    try {
        await respuestaCliente(`/clientes/${cliente.idCliente}/estado`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: !cliente.activo })
        });
        formCliente.style.display = "none";
        await cargarClientes();
        await mostrarDetalleCliente(cliente.idCliente);
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById("btnClientes").addEventListener("click", async () => {
    modalClientes.classList.add("activo");
    formCliente.style.display = "none";
    clienteSeleccionado = null;
    detalleCliente.innerHTML = '<p class="clientes-vacio">Selecciona un cliente para consultar su información e historial.</p>';
    await cargarClientes();
});

document.getElementById("btnCerrarClientes").addEventListener("click", () => {
    modalClientes.classList.remove("activo");
});

document.getElementById("btnNuevoCliente").addEventListener("click", () => abrirFormularioCliente());
document.getElementById("btnCancelarCliente").addEventListener("click", () => {
    formCliente.style.display = "none";
});

listaClientes.addEventListener("click", async evento => {
    const boton = evento.target.closest(".tarjeta-cliente");
    if (!boton) return;
    try {
        await mostrarDetalleCliente(Number(boton.dataset.idCliente));
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById("buscarCliente").addEventListener("input", () => {
    clearTimeout(temporizadorBusquedaClientes);
    temporizadorBusquedaClientes = setTimeout(() => cargarClientes(), 250);
});

document.getElementById("mostrarClientesInactivos").addEventListener("change", () => {
    cargarClientes();
});

formCliente.addEventListener("submit", async evento => {
    evento.preventDefault();
    const idCliente = Number(formCliente.dataset.idCliente) || null;
    const datos = {
        nombre: document.getElementById("clienteNombre").value.trim(),
        telefono: document.getElementById("clienteTelefono").value.trim(),
        dpiNit: document.getElementById("clienteDpiNit").value.trim() || null,
        direccion: document.getElementById("clienteDireccion").value.trim() || null,
        activo: clienteSeleccionado?.activo ?? true
    };
    const boton = formCliente.querySelector('button[type="submit"]');
    boton.disabled = true;
    try {
        const resultado = await respuestaCliente(
            idCliente ? `/clientes/${idCliente}` : "/clientes",
            {
                method: idCliente ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            }
        );
        const idGuardado = idCliente || resultado.idCliente;
        formCliente.style.display = "none";
        await cargarClientes();
        await mostrarDetalleCliente(idGuardado);
    } catch (error) {
        alert(error.message);
    } finally {
        boton.disabled = false;
    }
});
