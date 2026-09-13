// ======================================================
// EQUIVALENCIAS - NUEVO PRODUCTO
// ======================================================

let equivalenciasPendientes = [];

function agregarEquivalenciaPendiente(marca, codigo) {

    marca = (marca ?? "").trim();
    codigo = (codigo ?? "").trim();

    if (!marca || !codigo) {
        alert("Debe ingresar la marca y el código de la equivalencia.");
        return false;
    }

    const existe = equivalenciasPendientes.some(e =>
        e.marca.toLowerCase() === marca.toLowerCase() &&
        e.codigo.toLowerCase() === codigo.toLowerCase()
    );

    if (existe) {
        alert("Esa equivalencia ya fue agregada.");
        return false;
    }

    equivalenciasPendientes.push({
        marca: marca,
        codigo: codigo
    });

    mostrarEquivalenciasPendientes();

    return true;
}

function eliminarEquivalenciaPendiente(indice) {

    if (
        indice < 0 ||
        indice >= equivalenciasPendientes.length
    ) {
        return;
    }

    equivalenciasPendientes.splice(indice, 1);

    mostrarEquivalenciasPendientes();
}

function mostrarEquivalenciasPendientes() {

    const contenedor =
        document.getElementById("listaEquivalencias");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    if (equivalenciasPendientes.length === 0) {

        contenedor.innerHTML = `
            <p class="sin-equivalencias">
                No hay equivalencias agregadas.
            </p>
        `;

        return;
    }

    equivalenciasPendientes.forEach(
        (equivalencia, indice) => {

            const fila =
                document.createElement("div");

            fila.classList.add(
                "fila-equivalencia"
            );

            fila.innerHTML = `
                <div class="datos-equivalencia">
                    <strong>${equivalencia.marca}</strong>
                    <span>${equivalencia.codigo}</span>
                </div>

                <button
                    type="button"
                    class="btn-eliminar-equivalencia"
                    data-indice="${indice}"
                >
                    🗑️
                </button>
            `;

            contenedor.appendChild(fila);
        }
    );
}

async function guardarEquivalenciasProducto(idProducto) {

    if (
        !idProducto ||
        equivalenciasPendientes.length === 0
    ) {
        return;
    }

    for (
        const equivalencia
        of equivalenciasPendientes
    ) {

        const datos = {
            IdProducto: Number(idProducto),
            Marca: equivalencia.marca,
            Codigo: equivalencia.codigo
        };

        const respuesta =
            await fetch(
                `${API_URL}/equivalencias`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(datos)
                }
            );

        if (!respuesta.ok) {

            let mensaje =
                "No se pudo guardar una equivalencia.";

            try {
                const error =
                    await respuesta.json();

                mensaje =
                    error.mensaje ||
                    mensaje;

            } catch {
                // Mantener mensaje genérico.
            }

            throw new Error(mensaje);
        }
    }
}

document.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-eliminar-equivalencia[data-indice]"
            );

        if (!boton) {
            return;
        }

        const indice =
            Number(
                boton.dataset.indice
            );

        eliminarEquivalenciaPendiente(indice);
    }
);


// ======================================================
// CARGAR EQUIVALENCIAS PARA EDITAR
// ======================================================

async function cargarEquivalenciasEditar(idProducto) {

    const contenedor =
        document.getElementById(
            "listaEquivalenciasEditar"
        );

    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `
        <p class="sin-equivalencias">
            Cargando equivalencias...
        </p>
    `;


    try {

        const respuesta =
            await fetch(
                `${API_URL}/equivalencias/producto/${idProducto}`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las equivalencias."
            );
        }


        const equivalencias =
            await respuesta.json();


        contenedor.innerHTML = "";


        if (equivalencias.length === 0) {

            contenedor.innerHTML = `
                <p class="sin-equivalencias">
                    Este producto no tiene equivalencias.
                </p>
            `;

            return;
        }


        equivalencias.forEach(
            equivalencia => {

                // ------------------------------------------
                // CREAR FILA
                // ------------------------------------------

                const fila =
                    document.createElement(
                        "div"
                    );

                fila.classList.add(
                    "fila-equivalencia"
                );


                // ------------------------------------------
                // DATOS DE LA EQUIVALENCIA
                // ------------------------------------------

                const datos =
                    document.createElement(
                        "div"
                    );

                datos.classList.add(
                    "datos-equivalencia"
                );


                datos.innerHTML = `
                    <strong>
                        ${equivalencia.marca}
                    </strong>

                    <span>
                        ${equivalencia.codigo}
                    </span>
                `;


                // ------------------------------------------
                // BOTÓN ELIMINAR
                // ------------------------------------------

                const botonEliminar =
                    document.createElement(
                        "button"
                    );


                botonEliminar.type =
                    "button";


                botonEliminar.classList.add(
                    "btn-eliminar-equivalencia"
                );


                botonEliminar.textContent =
                    "🗑️";


                botonEliminar.dataset.idEquivalencia =
                    equivalencia.idEquivalencia;


                // ------------------------------------------
                // ARMAR FILA
                // ------------------------------------------

                fila.appendChild(
                    datos
                );


                fila.appendChild(
                    botonEliminar
                );


                contenedor.appendChild(
                    fila
                );

            }
        );


    } catch (error) {

        console.error(
            "Error cargando equivalencias:",
            error
        );


        contenedor.innerHTML = `
            <p class="sin-equivalencias">
                No se pudieron cargar las equivalencias.
            </p>
        `;
    }
}



// ======================================================
// ELIMINAR EQUIVALENCIA AL EDITAR
// ======================================================

const listaEquivalenciasEditar =
    document.getElementById(
        "listaEquivalenciasEditar"
    );


if (listaEquivalenciasEditar) {

    listaEquivalenciasEditar.addEventListener(
        "click",
        async function (evento) {

            // ------------------------------------------
            // COMPROBAR SI SE PULSÓ EL BOTÓN
            // ------------------------------------------

            const boton =
                evento.target.closest(
                    ".btn-eliminar-equivalencia"
                );


            if (!boton) {
                return;
            }


            evento.preventDefault();
            evento.stopPropagation();


            // ------------------------------------------
            // OBTENER ID
            // ------------------------------------------

            const idEquivalencia =
                boton.dataset.idEquivalencia;


            console.log(
                "Botón eliminar equivalencia presionado."
            );


            console.log(
                "ID equivalencia:",
                idEquivalencia
            );


            // ------------------------------------------
            // CONFIRMAR
            // ------------------------------------------

            const confirmar =
                confirm(
                    "¿Desea eliminar esta equivalencia?"
                );


            if (!confirmar) {
                return;
            }


            try {

                // --------------------------------------
                // DELETE
                // --------------------------------------

                const respuesta =
                    await fetch(
                        `${API_URL}/equivalencias/${idEquivalencia}`,
                        {
                            method: "DELETE"
                        }
                    );


                let resultado =
                    null;


                // --------------------------------------
                // LEER RESPUESTA
                // --------------------------------------

                try {

                    resultado =
                        await respuesta.json();

                } catch {
                    // La API puede no devolver JSON.
                }


                // --------------------------------------
                // COMPROBAR ERROR
                // --------------------------------------

                if (!respuesta.ok) {

                    throw new Error(
                        resultado?.mensaje ||
                        "No se pudo eliminar la equivalencia."
                    );
                }


                // --------------------------------------
                // MENSAJE
                // --------------------------------------

                alert(
                    resultado?.mensaje ||
                    "Equivalencia eliminada correctamente."
                );


                // --------------------------------------
                // RECARGAR EQUIVALENCIAS
                // --------------------------------------

                await cargarEquivalenciasEditar(
                    Number(
                        editarIdProducto.value
                    )
                );


            } catch (error) {

                console.error(
                    "Error eliminando equivalencia:",
                    error
                );


                alert(
                    error.message ||
                    "Ocurrió un error al eliminar la equivalencia."
                );
            }

        }
    );
}

// ======================================================
// AGREGAR EQUIVALENCIA AL EDITAR
// ======================================================

const btnAgregarEquivalenciaEditar =
    document.getElementById(
        "btnAgregarEquivalenciaEditar"
    );

const formNuevaEquivalenciaEditar =
    document.getElementById(
        "formNuevaEquivalenciaEditar"
    );

const nuevaMarcaEquivalencia =
    document.getElementById(
        "nuevaMarcaEquivalencia"
    );

const nuevoCodigoEquivalencia =
    document.getElementById(
        "nuevoCodigoEquivalencia"
    );

const btnCancelarNuevaEquivalencia =
    document.getElementById(
        "btnCancelarNuevaEquivalencia"
    );

const btnGuardarNuevaEquivalencia =
    document.getElementById(
        "btnGuardarNuevaEquivalencia"
    );


// ======================================================
// MOSTRAR FORMULARIO
// ======================================================

if (btnAgregarEquivalenciaEditar) {

    btnAgregarEquivalenciaEditar.addEventListener(
        "click",
        function () {

            formNuevaEquivalenciaEditar.style.display =
                "block";

            btnAgregarEquivalenciaEditar.style.display =
                "none";

            nuevaMarcaEquivalencia.value = "";
            nuevoCodigoEquivalencia.value = "";

            nuevaMarcaEquivalencia.focus();

        }
    );
}


// ======================================================
// CANCELAR
// ======================================================

if (btnCancelarNuevaEquivalencia) {

    btnCancelarNuevaEquivalencia.addEventListener(
        "click",
        function () {

            cerrarFormularioNuevaEquivalencia();

        }
    );
}


// ======================================================
// CERRAR FORMULARIO
// ======================================================

function cerrarFormularioNuevaEquivalencia() {

    formNuevaEquivalenciaEditar.style.display =
        "none";

    btnAgregarEquivalenciaEditar.style.display =
        "block";

    nuevaMarcaEquivalencia.value = "";
    nuevoCodigoEquivalencia.value = "";
}


// ======================================================
// GUARDAR EQUIVALENCIA
// ======================================================

if (btnGuardarNuevaEquivalencia) {

    btnGuardarNuevaEquivalencia.addEventListener(
        "click",
        async function () {

            const idProducto =
                Number(
                    editarIdProducto.value
                );


            const marca =
                nuevaMarcaEquivalencia.value.trim();

            const codigo =
                nuevoCodigoEquivalencia.value.trim();


            // ------------------------------------------
            // VALIDAR PRODUCTO
            // ------------------------------------------

            if (!idProducto) {

                alert(
                    "No se pudo identificar el producto."
                );

                return;
            }


            // ------------------------------------------
            // VALIDAR MARCA
            // ------------------------------------------

            if (!marca) {

                alert(
                    "Debe ingresar la marca."
                );

                nuevaMarcaEquivalencia.focus();

                return;
            }


            // ------------------------------------------
            // VALIDAR CÓDIGO
            // ------------------------------------------

            if (!codigo) {

                alert(
                    "Debe ingresar el código."
                );

                nuevoCodigoEquivalencia.focus();

                return;
            }


            try {

                // --------------------------------------
                // ENVIAR A LA API
                // --------------------------------------

                const respuesta =
                    await fetch(
                        `${API_URL}/equivalencias`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    IdProducto:
                                        idProducto,

                                    Marca:
                                        marca,

                                    Codigo:
                                        codigo
                                })
                        }
                    );


                // --------------------------------------
                // LEER RESPUESTA
                // --------------------------------------

                const resultado =
                    await respuesta.json();


                // --------------------------------------
                // COMPROBAR ERROR
                // --------------------------------------

                if (!respuesta.ok) {

                    throw new Error(
                        resultado.mensaje ||
                        "No se pudo agregar la equivalencia."
                    );
                }


                // --------------------------------------
                // LIMPIAR FORMULARIO
                // --------------------------------------

                cerrarFormularioNuevaEquivalencia();


                // --------------------------------------
                // RECARGAR LISTA
                // --------------------------------------

                await cargarEquivalenciasEditar(
                    idProducto
                );


            } catch (error) {

                console.error(
                    "Error agregando equivalencia:",
                    error
                );


                alert(
                    error.message ||
                    "No se pudo agregar la equivalencia."
                );
            }

        }
    );
}


// ======================================================
// ENTER PARA GUARDAR
// ======================================================

if (nuevoCodigoEquivalencia) {

    nuevoCodigoEquivalencia.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key === "Enter") {

                evento.preventDefault();

                btnGuardarNuevaEquivalencia.click();

            }

        }
    );
}


// ======================================================
// BOTONES EDITAR
// ======================================================


// ======================================================
// NUEVA EQUIVALENCIA - NUEVO PRODUCTO
// ======================================================

const btnAgregarEquivalencia =
    document.getElementById(
        "btnAgregarEquivalencia"
    );

const formNuevaEquivalenciaProducto =
    document.getElementById(
        "formNuevaEquivalenciaProducto"
    );

const nuevaMarcaEquivalenciaProducto =
    document.getElementById(
        "nuevaMarcaEquivalenciaProducto"
    );

const nuevoCodigoEquivalenciaProducto =
    document.getElementById(
        "nuevoCodigoEquivalenciaProducto"
    );

const btnCancelarNuevaEquivalenciaProducto =
    document.getElementById(
        "btnCancelarNuevaEquivalenciaProducto"
    );

const btnGuardarNuevaEquivalenciaProducto =
    document.getElementById(
        "btnGuardarNuevaEquivalenciaProducto"
    );


// ======================================================
// MOSTRAR FORMULARIO
// ======================================================

if (btnAgregarEquivalencia) {

    btnAgregarEquivalencia.addEventListener(
        "click",
        function () {

            formNuevaEquivalenciaProducto.style.display =
                "block";

            btnAgregarEquivalencia.style.display =
                "none";

            nuevaMarcaEquivalenciaProducto.value = "";
            nuevoCodigoEquivalenciaProducto.value = "";

            nuevaMarcaEquivalenciaProducto.focus();
        }
    );

}


// ======================================================
// CERRAR FORMULARIO
// ======================================================

function cerrarFormularioNuevaEquivalenciaProducto() {

    formNuevaEquivalenciaProducto.style.display =
        "none";

    btnAgregarEquivalencia.style.display =
        "block";

    nuevaMarcaEquivalenciaProducto.value = "";
    nuevoCodigoEquivalenciaProducto.value = "";
}


// ======================================================
// CANCELAR
// ======================================================

if (btnCancelarNuevaEquivalenciaProducto) {

    btnCancelarNuevaEquivalenciaProducto.addEventListener(
        "click",
        function () {

            cerrarFormularioNuevaEquivalenciaProducto();

        }
    );

}


// ======================================================
// GUARDAR EQUIVALENCIA
// ======================================================

if (btnGuardarNuevaEquivalenciaProducto) {

    btnGuardarNuevaEquivalenciaProducto.addEventListener(
        "click",
        function () {

            const marca =
                nuevaMarcaEquivalenciaProducto.value.trim();

            const codigo =
                nuevoCodigoEquivalenciaProducto.value.trim();


            if (!marca) {

                alert(
                    "Debe ingresar la marca."
                );

                nuevaMarcaEquivalenciaProducto.focus();

                return;
            }


            if (!codigo) {

                alert(
                    "Debe ingresar el código."
                );

                nuevoCodigoEquivalenciaProducto.focus();

                return;
            }


            const agregada =
                agregarEquivalenciaPendiente(
                    marca,
                    codigo
                );


            if (agregada) {

                cerrarFormularioNuevaEquivalenciaProducto();

            }

        }
    );

}


// ======================================================
// ENTER EN EL CÓDIGO
// ======================================================

if (nuevoCodigoEquivalenciaProducto) {

    nuevoCodigoEquivalenciaProducto.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key === "Enter") {

                evento.preventDefault();

                btnGuardarNuevaEquivalenciaProducto.click();

            }

        }
    );

}

