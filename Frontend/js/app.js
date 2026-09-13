const API_URL = "http://localhost:5092/api";

let productos = [];

let textoBusqueda = "";

let categoriaSeleccionada = "";

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
                ".btn-eliminar-equivalencia"
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
// CARGAR PRODUCTOS
// ======================================================


// ======================================================
// ELEMENTOS DE CATEGORÍAS
// ======================================================

const modalCategorias =
    document.getElementById("modalCategorias");

const modalNuevaCategoria =
    document.getElementById("modalNuevaCategoria");

const modalEditarCategoria =
    document.getElementById("modalEditarCategoria");

const btnCategorias =
    document.getElementById("btnCategorias");

const btnCerrarCategorias =
    document.getElementById("btnCerrarCategorias");

const btnNuevaCategoria =
    document.getElementById("btnNuevaCategoria");

const btnCategoriasDesactivadas =
    document.getElementById(
        "btnCategoriasDesactivadas"
    );

const listaCategorias =
    document.getElementById("listaCategorias");

const formCategoria =
    document.getElementById("formCategoria");

const formEditarCategoria =
    document.getElementById(
        "formEditarCategoria"
    );

const btnCerrarNuevaCategoria =
    document.getElementById(
        "btnCerrarNuevaCategoria"
    );

const btnCancelarCategoria =
    document.getElementById(
        "btnCancelarCategoria"
    );

const btnCerrarEditarCategoria =
    document.getElementById(
        "btnCerrarEditarCategoria"
    );

const btnCancelarEditarCategoria =
    document.getElementById(
        "btnCancelarEditarCategoria"
    );

// ======================================================
// MODAL DE CATEGORÍAS
// ======================================================

function abrirModalCategorias() {

    modalCategorias.classList.add("activo");

    cargarCategoriasGestion();
}


function cerrarModalCategorias() {

    modalCategorias.classList.remove("activo");
}


btnCategorias.addEventListener(
    "click",
    abrirModalCategorias
);


btnCerrarCategorias.addEventListener(
    "click",
    cerrarModalCategorias
);


// ======================================================
// CARGAR CATEGORÍAS PARA ADMINISTRACIÓN
// ======================================================

async function cargarCategoriasGestion() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las categorías"
            );
        }


        const categorias =
            await respuesta.json();


        mostrarCategorias(
            categorias
        );


    } catch (error) {

        console.error(
            "Error cargando categorías:",
            error
        );


        listaCategorias.innerHTML = `
            <p>
                No se pudieron cargar las categorías.
            </p>
        `;
    }
}


// ======================================================
// MOSTRAR CATEGORÍAS
// ======================================================

function mostrarCategorias(lista) {

    listaCategorias.innerHTML = "";


    if (lista.length === 0) {

        listaCategorias.innerHTML = `
            <p>
                No hay categorías registradas.
            </p>
        `;

        return;
    }


    lista.forEach(categoria => {

        const tarjeta =
            document.createElement("div");


        tarjeta.classList.add(
            "tarjeta-categoria"
        );


        tarjeta.innerHTML = `

            <div>

                <h3>
                    ${categoria.nombre}
                </h3>

                <p>
                    ${categoria.descripcion ?? ""}
                </p>

            </div>


            <div class="acciones-producto">

                <button
                    class="btn-editar-categoria"
                    data-id="${categoria.idCategoria}"
                >
                     Editar
                </button>


                <button
                    class="btn-desactivar-categoria"
                    data-id="${categoria.idCategoria}"
                >
                    🚫 Desactivar
                </button>

            </div>

        `;


        listaCategorias.appendChild(
            tarjeta
        );

    });
}


// ======================================================
// NUEVA CATEGORÍA
// ======================================================

btnNuevaCategoria.addEventListener(
    "click",
    function () {

        formCategoria.reset();

        modalNuevaCategoria.classList.add(
            "activo"
        );

    }
);


btnCerrarNuevaCategoria.addEventListener(
    "click",
    function () {

        modalNuevaCategoria.classList.remove(
            "activo"
        );

    }
);


btnCancelarCategoria.addEventListener(
    "click",
    function () {

        modalNuevaCategoria.classList.remove(
            "activo"
        );

    }
);



// ======================================================
// CREAR CATEGORÍA
// ======================================================

formCategoria.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const categoria = {

            nombre:
                document
                    .getElementById(
                        "nombreCategoria"
                    )
                    .value
                    .trim(),

            descripcion:
                document
                    .getElementById(
                        "descripcionCategoria"
                    )
                    .value
                    .trim()

        };


        try {

            const respuesta =
                await fetch(
                    `${API_URL}/categorias`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                categoria
                            )
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
                    "No se pudo crear la categoría."
                );
            }


            alert(
                resultado.mensaje ||
                "Categoría creada correctamente."
            );


            modalNuevaCategoria.classList.remove(
                "activo"
            );


            await cargarCategoriasGestion();

            await cargarCategorias();


        } catch (error) {

            console.error(
                "Error creando categoría:",
                error
            );


            alert(
                error.message
            );
        }

    }
);

// ======================================================
// BOTÓN EDITAR CATEGORÍA
// ======================================================

listaCategorias.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-editar-categoria"
            );


        if (!boton) {
            return;
        }


        const id =
            boton.dataset.id;


        abrirEditarCategoria(id);

    }
);


// ======================================================
// ABRIR EDITAR CATEGORÍA
// ======================================================

async function abrirEditarCategoria(id) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias/${id}`
            );


        if (!respuesta.ok) {

            const error =
                await respuesta.json();

            throw new Error(
                error.mensaje ||
                "No se pudo cargar la categoría."
            );
        }


        const categoria =
            await respuesta.json();


        document.getElementById(
            "editarIdCategoria"
        ).value =
            categoria.idCategoria;


        document.getElementById(
            "editarNombreCategoria"
        ).value =
            categoria.nombre;


        document.getElementById(
            "editarDescripcionCategoria"
        ).value =
            categoria.descripcion ?? "";


        modalEditarCategoria.classList.add(
            "activo"
        );


    } catch (error) {

        console.error(
            "Error cargando categoría:",
            error
        );


        alert(
            error.message
        );
    }
}


// ======================================================
// ACTUALIZAR CATEGORÍA
// ======================================================

formEditarCategoria.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        const id =
            document.getElementById(
                "editarIdCategoria"
            ).value;


        const categoria = {

            nombre:
                document
                    .getElementById(
                        "editarNombreCategoria"
                    )
                    .value
                    .trim(),

            descripcion:
                document
                    .getElementById(
                        "editarDescripcionCategoria"
                    )
                    .value
                    .trim()

        };


        try {

            const respuesta =
                await fetch(
                    `${API_URL}/categorias/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                categoria
                            )
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
                    "No se pudo actualizar la categoría."
                );
            }


            alert(
                "Categoría actualizada correctamente."
            );


            modalEditarCategoria.classList.remove(
                "activo"
            );


            await cargarCategoriasGestion();

            await cargarCategorias();


        } catch (error) {

            console.error(
                "Error actualizando categoría:",
                error
            );


            alert(
                error.message
            );
        }

    }
);



btnCerrarEditarCategoria.addEventListener(
    "click",
    function () {

        modalEditarCategoria.classList.remove(
            "activo"
        );

    }
);


btnCancelarEditarCategoria.addEventListener(
    "click",
    function () {

        modalEditarCategoria.classList.remove(
            "activo"
        );

    }
);

// ======================================================
// DESACTIVAR CATEGORÍA
// ======================================================

async function desactivarCategoria(id) {

    const confirmar =
        confirm(
            "¿Está seguro de que desea desactivar esta categoría?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias/${id}`,
                {
                    method: "DELETE"
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo desactivar la categoría."
            );
        }


        alert(
            resultado.mensaje
        );


        await cargarCategoriasGestion();

        await cargarCategorias();


    } catch (error) {

        console.error(
            "Error desactivando categoría:",
            error
        );


        alert(
            error.message
        );
    }
}


// ======================================================
// BOTÓN DESACTIVAR CATEGORÍA
// ======================================================

listaCategorias.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-desactivar-categoria"
            );


        if (!boton) {
            return;
        }


        const id =
            boton.dataset.id;


        desactivarCategoria(id);

    }
);

// ======================================================
// CATEGORÍAS DESACTIVADAS
// ======================================================

btnCategoriasDesactivadas.addEventListener(
    "click",
    cargarCategoriasDesactivadas
);



// ======================================================
// CARGAR CATEGORÍAS DESACTIVADAS
// ======================================================

async function cargarCategoriasDesactivadas() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias/desactivadas`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las categorías desactivadas."
            );
        }


        const categorias =
            await respuesta.json();


        mostrarCategoriasDesactivadas(
            categorias
        );


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        listaCategorias.innerHTML = `
            <p>
                No se pudieron cargar las categorías desactivadas.
            </p>
        `;
    }
}

// ======================================================
// MOSTRAR CATEGORÍAS DESACTIVADAS
// ======================================================

function mostrarCategoriasDesactivadas(lista) {

    listaCategorias.innerHTML = "";


    if (lista.length === 0) {

        listaCategorias.innerHTML = `
            <p>
                No hay categorías desactivadas.
            </p>
        `;

        return;
    }


    lista.forEach(categoria => {

        const tarjeta =
            document.createElement("div");


        tarjeta.classList.add(
            "tarjeta-categoria"
        );


        tarjeta.innerHTML = `

            <div>

                <h3>
                    ${categoria.nombre}
                </h3>

                <p>
                    ${categoria.descripcion ?? ""}
                </p>

            </div>


            <div class="acciones-producto">

                <button
                    class="btn-reactivar-categoria"
                    data-id="${categoria.idCategoria}"
                >
                    🔄 Reactivar
                </button>

            </div>

        `;


        listaCategorias.appendChild(
            tarjeta
        );

    });
}

// ======================================================
// REACTIVAR CATEGORÍA
// ======================================================

async function reactivarCategoria(id) {

    const confirmar =
        confirm(
            "¿Desea reactivar esta categoría?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias/reactivar/${id}`,
                {
                    method: "PUT"
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.mensaje ||
                "No se pudo reactivar la categoría."
            );
        }


        alert(
            resultado.mensaje
        );


        await cargarCategoriasGestion();

        await cargarCategorias();


    } catch (error) {

        console.error(
            "Error reactivando categoría:",
            error
        );


        alert(
            error.message
        );
    }
}


// ======================================================
// BOTÓN REACTIVAR CATEGORÍA
// ======================================================

listaCategorias.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-reactivar-categoria"
            );


        if (!boton) {
            return;
        }


        const id =
            boton.dataset.id;


        reactivarCategoria(id);

    }
);





async function cargarProductos() {

    try {

        const respuesta =
            await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron obtener los productos"
            );
        }

        productos = await respuesta.json();

        mostrarProductos(productos);

    } catch (error) {

        console.error(
            "Error:",
            error
        );

        document.getElementById(
            "listaProductos"
        ).innerHTML = `
            <p>
                No se pudieron cargar los productos.
            </p>
        `;
    }
}


// ======================================================
// MOSTRAR PRODUCTOS
// ======================================================

function mostrarProductos(lista) {

    const contenedor =
        document.getElementById(
            "listaProductos"
        );

    contenedor.innerHTML = "";


    // --------------------------------------------------
    // SIN PRODUCTOS
    // --------------------------------------------------

    if (lista.length === 0) {

        contenedor.innerHTML = `
            <p>
                No se encontraron productos.
            </p>
        `;

        return;
    }


    // --------------------------------------------------
    // CREAR TARJETAS
    // --------------------------------------------------

    lista.forEach(producto => {

        const tarjeta =
            document.createElement("div");

        tarjeta.classList.add(
            "tarjeta-producto"
        );


        // --------------------------------------------------
        // IMAGEN
        // --------------------------------------------------

        const imagenHTML =
            producto.imagen
                ? `
                    <img
                        src="http://localhost:5092${producto.imagen}"
                        alt="${producto.nombre}"
                        class="imagen-producto"
                    >
                `
                : "";


        tarjeta.innerHTML = `

            ${imagenHTML}

            <h3>
                ${producto.nombre}
            </h3>

            <p>
                <strong>Código:</strong>
                ${producto.codigoBarras}
            </p>

            <p>
                <strong>Categoría:</strong>
                ${producto.categoria}
            </p>

            <p>
                <strong>Precio compra:</strong>
                Q${Number(
                    producto.precioCompra
                ).toFixed(2)}
            </p>

            <p class="precio">
                Precio venta:
                Q${Number(
                    producto.precioVenta
                ).toFixed(2)}
            </p>

            <p class="stock">
                Stock:
                ${producto.stock}
            </p>

            <p>
                ${producto.descripcion ?? ""}
            </p>

            <div class="acciones-producto">

                <button
                    class="btn-editar"
                    data-id="${producto.idProducto}"
                >
                     Editar Producto
                </button>

                <button
                    class="btn-desactivar"
                    data-id="${producto.idProducto}"
                >
                     Desactivar Producto
                </button>

            </div>







        `;

        contenedor.appendChild(
            tarjeta
        );
    });
}


// ======================================================
// APLICAR BÚSQUEDA Y FILTROS
// ======================================================

function aplicarFiltros() {

    const texto =
        textoBusqueda
            .toLowerCase()
            .trim();


    const listaFiltrada =
        productos.filter(producto => {


            // --------------------------------------------------
            // BUSCAR POR NOMBRE
            // --------------------------------------------------

            const nombre =
                (producto.nombre ?? "")
                    .toLowerCase();


            // --------------------------------------------------
            // BUSCAR POR CÓDIGO DE BARRAS
            // --------------------------------------------------

            const codigo =
                (producto.codigoBarras ?? "")
                    .toString()
                    .toLowerCase();


            // --------------------------------------------------
            // BUSCAR POR DESCRIPCIÓN
            // --------------------------------------------------

            const descripcion =
                (producto.descripcion ?? "")
                    .toLowerCase();


            // --------------------------------------------------
            // COMPROBAR TEXTO
            // --------------------------------------------------

            const coincideTexto =

                nombre.includes(texto)

                ||

                codigo.includes(texto)

                ||

                descripcion.includes(texto);


            // --------------------------------------------------
            // COMPROBAR CATEGORÍA
            // --------------------------------------------------

            const coincideCategoria =

                !categoriaSeleccionada

                ||

                producto.idCategoria
                    .toString() ===
                    categoriaSeleccionada;


            // --------------------------------------------------
            // RESULTADO FINAL
            // --------------------------------------------------

            return (
                coincideTexto &&
                coincideCategoria
            );

        });


    mostrarProductos(
        listaFiltrada
    );
}


// ======================================================
// INICIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();

    cargarCategorias();

});


// ======================================================
// ELEMENTOS DEL MODAL
// ======================================================

const modalProducto =
    document.getElementById(
        "modalProducto"
    );

const btnNuevoProducto =
    document.getElementById(
        "btnNuevoProducto"
    );

const btnCerrarModal =
    document.getElementById(
        "btnCerrarModal"
    );

const btnCancelar =
    document.getElementById(
        "btnCancelar"
    );

const formProducto =
    document.getElementById(
        "formProducto"
    );

const selectCategoria =
    document.getElementById(
        "idCategoria"
    );


// ======================================================
// ELEMENTOS DE BÚSQUEDA
// ======================================================

const buscarProducto =
    document.getElementById(
        "buscarProducto"
    );

const filtroCategoria =
    document.getElementById(
        "filtroCategoria"
    );



// ======================================================
// ELEMENTOS DEL MODAL DE EDICIÓN
// ======================================================

const modalEditarProducto =
    document.getElementById(
        "modalEditarProducto"
    );

const btnCerrarEditar =
    document.getElementById(
        "btnCerrarEditar"
    );

const btnCancelarEditar =
    document.getElementById(
        "btnCancelarEditar"
    );

const formEditarProducto =
    document.getElementById(
        "formEditarProducto"
    );

const editarIdProducto =
    document.getElementById(
        "editarIdProducto"
    );

const editarCodigoBarras =
    document.getElementById(
        "editarCodigoBarras"
    );

const editarNombre =
    document.getElementById(
        "editarNombre"
    );

const editarCategoria =
    document.getElementById(
        "editarCategoria"
    );

const editarPrecioCompra =
    document.getElementById(
        "editarPrecioCompra"
    );

const editarPrecioVenta =
    document.getElementById(
        "editarPrecioVenta"
    );

const editarStock =
    document.getElementById(
        "editarStock"
    );

const editarDescripcion =
    document.getElementById(
        "editarDescripcion"
    );

const editarImagen =
    document.getElementById(
        "editarImagen"
    );

const imagenActual =
    document.getElementById(
        "imagenActual"
    );




// ======================================================
// ABRIR MODAL DE EDICIÓN
// ======================================================

async function abrirModalEditar(id) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/productos/${id}`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener el producto"
            );

        }


        const producto =
            await respuesta.json();


        console.log(
            "Producto para editar:",
            producto
        );


        // --------------------------------------------------
        // CARGAR CATEGORÍAS
        // --------------------------------------------------

        await cargarCategoriasEditar();


        // --------------------------------------------------
        // LLENAR FORMULARIO
        // --------------------------------------------------

        editarIdProducto.value =
            producto.idProducto;

        editarCodigoBarras.value =
            producto.codigoBarras;

        editarNombre.value =
            producto.nombre;

        editarCategoria.value =
            producto.idCategoria;

        editarPrecioCompra.value =
            producto.precioCompra;

        editarPrecioVenta.value =
            producto.precioVenta;

        editarStock.value =
            producto.stock;

        editarDescripcion.value =
            producto.descripcion ?? "";


        // --------------------------------------------------
        // LIMPIAR NUEVA IMAGEN
        // --------------------------------------------------

        editarImagen.value = "";


        // --------------------------------------------------
        // MOSTRAR IMAGEN ACTUAL
        // --------------------------------------------------

        if (producto.imagen) {

            imagenActual.innerHTML = `
                <img
                    src="http://localhost:5092${producto.imagen}"
                    alt="${producto.nombre}"
                >
            `;

        } else {

            imagenActual.innerHTML = `
                <p>
                    Este producto no tiene imagen.
                </p>
            `;

        }
        await cargarEquivalenciasEditar(
            producto.idProducto
        );

        // --------------------------------------------------
        // MOSTRAR MODAL
        // --------------------------------------------------

        modalEditarProducto.classList.add(
            "activo"
        );


    } catch (error) {

        console.error(
            "Error cargando producto:",
            error
        );

        alert(
            "No se pudo cargar la información del producto."
        );

    }
}

// ======================================================
// CARGAR CATEGORÍAS PARA EDITAR
// ======================================================

async function cargarCategoriasEditar() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las categorías"
            );

        }


        const categorias =
            await respuesta.json();


        editarCategoria.innerHTML = `
            <option value="">
                Seleccione una categoría
            </option>
        `;


        categorias.forEach(
            categoria => {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    categoria.idCategoria;


                opcion.textContent =
                    categoria.nombre;


                editarCategoria.appendChild(
                    opcion
                );

            }
        );


    } catch (error) {

        console.error(
            "Error cargando categorías para editar:",
            error
        );

        editarCategoria.innerHTML = `
            <option value="">
                Error al cargar categorías
            </option>
        `;

    }
}



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

const listaProductos =
    document.getElementById(
        "listaProductos"
    );


// ======================================================
// BOTONES DE PRODUCTOS
// ======================================================

listaProductos.addEventListener(
    "click",
    function (evento) {

        // --------------------------------------------------
        // BOTÓN EDITAR
        // --------------------------------------------------

        const botonEditar =
            evento.target.closest(
                ".btn-editar"
            );


        if (botonEditar) {

            const id =
                botonEditar.dataset.id;

            abrirModalEditar(id);

            return;
        }


        // --------------------------------------------------
        // BOTÓN DESACTIVAR
        // --------------------------------------------------

        const botonDesactivar =
            evento.target.closest(
                ".btn-desactivar"
            );


        if (botonDesactivar) {

            const id =
                botonDesactivar.dataset.id;

            desactivarProducto(id);
        }

    }
);





// ======================================================
// CERRAR MODAL DE EDICIÓN
// ======================================================

function cerrarModalEditar() {

    modalEditarProducto.classList.remove(
        "activo"
    );

    formEditarProducto.reset();

    imagenActual.innerHTML = "";
}


btnCerrarEditar.addEventListener(
    "click",
    cerrarModalEditar
);


btnCancelarEditar.addEventListener(
    "click",
    cerrarModalEditar
);



// ======================================================
// DESACTIVAR PRODUCTO
// ======================================================

async function desactivarProducto(id) {

    // --------------------------------------------------
    // CONFIRMAR ACCIÓN
    // --------------------------------------------------

    const confirmar =
        confirm(
            "¿Está seguro de que desea desactivar este producto?"
        );


    if (!confirmar) {
        return;
    }


    try {

        // --------------------------------------------------
        // ENVIAR DELETE
        // --------------------------------------------------

        const respuesta =
            await fetch(
                `${API_URL}/productos/${id}`,
                {
                    method: "DELETE"
                }
            );


        // --------------------------------------------------
        // COMPROBAR RESPUESTA
        // --------------------------------------------------

        if (!respuesta.ok) {

            const error =
                await respuesta.json();

            throw new Error(
                error.mensaje ||
                "No se pudo desactivar el producto."
            );
        }


        // --------------------------------------------------
        // RESPUESTA API
        // --------------------------------------------------

        const resultado =
            await respuesta.json();


        console.log(
            "Producto desactivado:",
            resultado
        );


        alert(
            resultado.mensaje ||
            "Producto desactivado correctamente."
        );


        // --------------------------------------------------
        // ACTUALIZAR LISTA
        // --------------------------------------------------

        await cargarProductos();


    } catch (error) {

        console.error(
            "Error desactivando producto:",
            error
        );


        alert(
            error.message ||
            "No se pudo desactivar el producto."
        );
    }
}



// ======================================================
// ACTUALIZAR PRODUCTO
// ======================================================

formEditarProducto.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        // --------------------------------------------------
        // OBTENER ID
        // --------------------------------------------------

        const id =
            editarIdProducto.value;


        // --------------------------------------------------
        // OBTENER DATOS
        // --------------------------------------------------

        const codigoBarras =
            editarCodigoBarras.value.trim();

        const nombre =
            editarNombre.value.trim();

        const idCategoria =
            Number(
                editarCategoria.value
            );

        const precioCompra =
            Number(
                editarPrecioCompra.value
            );

        const precioVenta =
            Number(
                editarPrecioVenta.value
            );

        const stock =
            Number(
                editarStock.value
            );

        const descripcion =
            editarDescripcion.value.trim();

        const archivoImagen =
            editarImagen.files[0];


        // ==================================================
        // VALIDACIONES
        // ==================================================

        if (!/^\d{8,14}$/.test(codigoBarras)) {

            alert(
                "El código de barras debe contener entre 8 y 14 números."
            );

            return;
        }


        if (nombre.length < 2) {

            alert(
                "El nombre del producto debe tener al menos 2 caracteres."
            );

            return;
        }


        if (!idCategoria) {

            alert(
                "Debe seleccionar una categoría."
            );

            return;
        }


        if (
            !Number.isFinite(precioCompra) ||
            precioCompra < 0
        ) {

            alert(
                "El precio de compra no es válido."
            );

            return;
        }


        if (
            !Number.isFinite(precioVenta) ||
            precioVenta < 0
        ) {

            alert(
                "El precio de venta no es válido."
            );

            return;
        }


        if (precioVenta < precioCompra) {

            alert(
                "El precio de venta no puede ser menor que el precio de compra."
            );

            return;
        }


        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            alert(
                "El stock debe ser un número entero mayor o igual a 0."
            );

            return;
        }


        if (descripcion.length > 500) {

            alert(
                "La descripción no puede superar los 500 caracteres."
            );

            return;
        }


        // ==================================================
        // VALIDAR NUEVA IMAGEN
        // ==================================================

        if (archivoImagen) {

            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !tiposPermitidos.includes(
                    archivoImagen.type
                )
            ) {

                alert(
                    "La imagen debe ser JPG, PNG o WEBP."
                );

                return;
            }


            const tamañoMaximo =
                5 * 1024 * 1024;


            if (
                archivoImagen.size >
                tamañoMaximo
            ) {

                alert(
                    "La imagen no puede superar los 5 MB."
                );

                return;
            }
        }


        // ==================================================
        // CREAR FORMDATA
        // ==================================================

        const datosFormulario =
            new FormData();


        datosFormulario.append(
            "CodigoBarras",
            codigoBarras
        );


        datosFormulario.append(
            "Nombre",
            nombre
        );


        datosFormulario.append(
            "IdCategoria",
            idCategoria
        );


        datosFormulario.append(
            "PrecioCompra",
            precioCompra
        );


        datosFormulario.append(
            "PrecioVenta",
            precioVenta
        );


        datosFormulario.append(
            "Descripcion",
            descripcion
        );


        datosFormulario.append(
            "Stock",
            stock
        );


        // Conservamos el estado actual del producto

        datosFormulario.append(
            "Estado",
            "true"
        );


        // --------------------------------------------------
        // NUEVA IMAGEN, SOLO SI SE SELECCIONÓ
        // --------------------------------------------------

        if (archivoImagen) {

            datosFormulario.append(
                "Imagen",
                archivoImagen
            );
        }


        // ==================================================
        // ENVIAR PUT
        // ==================================================

        try {

            const respuesta =
                await fetch(
                    `${API_URL}/productos/${id}`,
                    {
                        method: "PUT",
                        body: datosFormulario
                    }
                );


            // --------------------------------------------------
            // COMPROBAR RESPUESTA
            // --------------------------------------------------

            if (!respuesta.ok) {

                const datosError =
                    await respuesta.json();

                throw new Error(
                    JSON.stringify(
                        datosError
                    )
                );
            }


            // --------------------------------------------------
            // PRODUCTO ACTUALIZADO
            // --------------------------------------------------

            const resultado =
                await respuesta.json();


            console.log(
                "Producto actualizado:",
                resultado
            );


            alert(
                "Producto actualizado correctamente"
            );


            // --------------------------------------------------
            // CERRAR MODAL
            // --------------------------------------------------

            cerrarModalEditar();


            // --------------------------------------------------
            // RECARGAR PRODUCTOS
            // --------------------------------------------------

            await cargarProductos();

            equivalenciasPendientes = [];


        } catch (error) {

            console.error(
                "Error actualizando producto:",
                error
            );


            try {

                const datosError =
                    JSON.parse(
                        error.message
                    );


                if (
                    datosError.mensaje
                ) {

                    alert(
                        datosError.mensaje
                    );

                    return;
                }


            } catch {

                // Error no proveniente de la API

            }


            alert(
                "No se pudo actualizar el producto."
            );
        }

    }
);



// ======================================================
// BUSCADOR CON EQUIVALENCIAS
// ======================================================

let temporizadorBusqueda = null;

buscarProducto.addEventListener(
    "input",
    function () {

        textoBusqueda = this.value.trim();

        clearTimeout(temporizadorBusqueda);

        temporizadorBusqueda = setTimeout(
            buscarProductos,
            300
        );
    }
);


// ======================================================
// BUSCAR PRODUCTOS EN LA API
// ======================================================

async function buscarProductos() {

    const termino = textoBusqueda.trim();

    // --------------------------------------------------
    // SI NO HAY TEXTO, MOSTRAR TODOS LOS PRODUCTOS
    // --------------------------------------------------

    if (!termino) {

        aplicarFiltros();

        return;
    }


    try {

        // --------------------------------------------------
        // CONSTRUIR URL
        // --------------------------------------------------

        const parametros =
            new URLSearchParams();

        parametros.append(
            "termino",
            termino
        );


        // --------------------------------------------------
        // CONSULTAR API
        // --------------------------------------------------

        const respuesta =
            await fetch(
                `${API_URL}/productos/buscar?${parametros.toString()}`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron buscar los productos."
            );
        }


        const resultados =
            await respuesta.json();


        // --------------------------------------------------
        // APLICAR FILTRO DE CATEGORÍA
        // --------------------------------------------------

        const resultadosFiltrados =
            resultados.filter(producto => {

                return (
                    !categoriaSeleccionada
                    ||
                    producto.idCategoria
                        .toString()
                        === categoriaSeleccionada
                );

            });


        // --------------------------------------------------
        // MOSTRAR RESULTADOS
        // --------------------------------------------------

        mostrarProductos(
            resultadosFiltrados
        );


    } catch (error) {

        console.error(
            "Error buscando productos:",
            error
        );


        document.getElementById(
            "listaProductos"
        ).innerHTML = `
            <p>
                No se pudieron buscar los productos.
            </p>
        `;
    }
}


// ======================================================
// FILTRO POR CATEGORÍA
// ======================================================

filtroCategoria.addEventListener(
    "change",
    function () {

        categoriaSeleccionada =
            this.value;


        // Si hay texto de búsqueda,
        // volver a consultar la API.

        if (textoBusqueda.trim()) {

            buscarProductos();

        } else {

            aplicarFiltros();

        }

    }
);

// ======================================================
// FILTRO POR CATEGORÍA
// ======================================================

filtroCategoria.addEventListener(
    "change",
    function () {

        categoriaSeleccionada =
            this.value;

        aplicarFiltros();

    }
);


// ======================================================
// ABRIR MODAL
// ======================================================

function abrirModalProducto() {

    equivalenciasPendientes = [];

    mostrarEquivalenciasPendientes();

    modalProducto.classList.add(
        "activo"
    );

    cargarCategorias();
}


// ======================================================
// CERRAR MODAL
// ======================================================

function cerrarModalProducto() {

    modalProducto.classList.remove(
        "activo"
    );

    formProducto.reset();

    equivalenciasPendientes = [];

    mostrarEquivalenciasPendientes();
}


// ======================================================
// EVENTOS DEL MODAL
// ======================================================

btnNuevoProducto.addEventListener(
    "click",
    abrirModalProducto
);

btnCerrarModal.addEventListener(
    "click",
    cerrarModalProducto
);

btnCancelar.addEventListener(
    "click",
    cerrarModalProducto
);


// ======================================================
// CARGAR EQUIVALENCIAS DE PRODUCTO AL EDITAR
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

                const fila =
                    document.createElement(
                        "div"
                    );

                fila.classList.add(
                    "fila-equivalencia"
                );


                fila.innerHTML = `
                    <div class="datos-equivalencia">

                        <strong>
                            ${equivalencia.marca}
                        </strong>

                        <span>
                            ${equivalencia.codigo}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="btn-eliminar-equivalencia"
                        data-id-equivalencia="${equivalencia.idEquivalencia}"
                    >
                        🗑️
                    </button>
                `;


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
// CARGAR CATEGORÍAS
// ======================================================

async function cargarCategorias() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/categorias`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar las categorías"
            );
        }


        const categorias =
            await respuesta.json();


        // --------------------------------------------------
        // LIMPIAR SELECT DEL FORMULARIO NUEVO
        // --------------------------------------------------

        selectCategoria.innerHTML = `
            <option value="">
                Seleccione una categoría
            </option>
        `;


        // --------------------------------------------------
        // LIMPIAR SELECT DEL FILTRO
        // --------------------------------------------------

        filtroCategoria.innerHTML = `
            <option value="">
                Todas las categorías
            </option>
        `;


        // --------------------------------------------------
        // SELECT DEL FORMULARIO EDITAR
        // --------------------------------------------------

        const editarCategoria =
            document.getElementById(
                "editarCategoria"
            );


        editarCategoria.innerHTML = `
            <option value="">
                Seleccione una categoría
            </option>
        `;


        // --------------------------------------------------
        // AGREGAR CATEGORÍAS
        // --------------------------------------------------

        categorias.forEach(
            categoria => {


                // ------------------------------------------
                // SELECT NUEVO PRODUCTO
                // ------------------------------------------

                const opcionFormulario =
                    document.createElement(
                        "option"
                    );

                opcionFormulario.value =
                    categoria.idCategoria;

                opcionFormulario.textContent =
                    categoria.nombre;

                selectCategoria.appendChild(
                    opcionFormulario
                );


                // ------------------------------------------
                // SELECT DEL FILTRO
                // ------------------------------------------

                const opcionFiltro =
                    document.createElement(
                        "option"
                    );

                opcionFiltro.value =
                    categoria.idCategoria;

                opcionFiltro.textContent =
                    categoria.nombre;

                filtroCategoria.appendChild(
                    opcionFiltro
                );


                // ------------------------------------------
                // SELECT EDITAR PRODUCTO
                // ------------------------------------------

                const opcionEditar =
                    document.createElement(
                        "option"
                    );

                opcionEditar.value =
                    categoria.idCategoria;

                opcionEditar.textContent =
                    categoria.nombre;

                editarCategoria.appendChild(
                    opcionEditar
                );

            }
        );


    } catch (error) {

        console.error(
            "Error cargando categorías:",
            error
        );


        selectCategoria.innerHTML = `
            <option value="">
                Error al cargar categorías
            </option>
        `;

    }
}


// ======================================================
// CARGAR PRODUCTOS DESACTIVADOS
// ======================================================

async function cargarProductosDesactivados() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/productos/desactivados`
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron cargar los productos desactivados"
            );
        }

        const productosDesactivados =
            await respuesta.json();

        mostrarProductosDesactivados(
            productosDesactivados
        );

    } catch (error) {

        console.error(
            "Error cargando productos desactivados:",
            error
        );

        alert(
            "No se pudieron cargar los productos desactivados."
        );
    }
}


// ======================================================
// MOSTRAR PRODUCTOS DESACTIVADOS
// ======================================================

function mostrarProductosDesactivados(lista) {

    const contenedor =
        document.getElementById(
            "listaProductos"
        );

    contenedor.innerHTML = "";


    if (lista.length === 0) {

        contenedor.innerHTML = `
            <p>
                No hay productos desactivados.
            </p>
        `;

        return;
    }


    lista.forEach(producto => {

        const tarjeta =
            document.createElement("div");

        tarjeta.classList.add(
            "tarjeta-producto"
        );


        let imagenHTML = "";


        if (producto.imagen) {

            imagenHTML = `
                <img
                    src="http://localhost:5092${producto.imagen}"
                    alt="${producto.nombre}"
                    class="imagen-producto"
                >
            `;

        } else {

            imagenHTML = `
                <div class="sin-imagen">
                    Sin imagen
                </div>
            `;
        }


        tarjeta.innerHTML = `

            ${imagenHTML}

            <h3>
                ${producto.nombre}
            </h3>

            <p>
                <strong>Código:</strong>
                ${producto.codigoBarras}
            </p>

            <p>
                <strong>Categoría:</strong>
                ${producto.categoria}
            </p>

            <p>
                <strong>Precio venta:</strong>
                Q${Number(
                    producto.precioVenta
                ).toFixed(2)}
            </p>

            <p>
                <strong>Stock:</strong>
                ${producto.stock}
            </p>

            <p>
                ${producto.descripcion ?? ""}
            </p>

            <div class="acciones-producto">

                <button
                    class="btn-reactivar"
                    data-id="${producto.idProducto}"
                >
                    🔄 Reactivar
                </button>

            </div>

        `;


        contenedor.appendChild(
            tarjeta
        );

    });
}

// ======================================================
// REACTIVAR PRODUCTO
// ======================================================

async function reactivarProducto(id) {

    const confirmar =
        confirm(
            "¿Desea reactivar este producto?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/productos/reactivar/${id}`,
                {
                    method: "PUT"
                }
            );


        if (!respuesta.ok) {

            const error =
                await respuesta.json();

            throw new Error(
                error.mensaje ||
                "No se pudo reactivar el producto."
            );
        }


        const resultado =
            await respuesta.json();


        alert(
            resultado.mensaje ||
            "Producto reactivado correctamente."
        );


        // Volver a mostrar productos activos

        await cargarProductos();


    } catch (error) {

        console.error(
            "Error reactivando producto:",
            error
        );


        alert(
            error.message ||
            "No se pudo reactivar el producto."
        );
    }
}



// ======================================================
// BOTÓN: AGREGAR EQUIVALENCIA
// ======================================================

const btnAgregarEquivalencia =
    document.getElementById(
        "btnAgregarEquivalencia"
    );


if (btnAgregarEquivalencia) {

    btnAgregarEquivalencia.addEventListener(
        "click",
        function () {

            const marca =
                prompt(
                    "Ingrese la marca de la equivalencia:"
                );


            if (marca === null) {
                return;
            }


            const codigo =
                prompt(
                    "Ingrese el código de la equivalencia:"
                );


            if (codigo === null) {
                return;
            }


            agregarEquivalenciaPendiente(
                marca,
                codigo
            );
        }
    );
}

// ======================================================
// BOTÓN REACTIVAR
// ======================================================

listaProductos.addEventListener(
    "click",
    function (evento) {

        const boton =
            evento.target.closest(
                ".btn-reactivar"
            );


        if (!boton) {
            return;
        }


        const id =
            boton.dataset.id;


        reactivarProducto(id);

    }
);


// ======================================================
// PRODUCTOS DESACTIVADOS
// ======================================================

const btnProductosDesactivados =
    document.getElementById(
        "btnProductosDesactivados"
    );


btnProductosDesactivados.addEventListener(
    "click",
    cargarProductosDesactivados
);


// ======================================================
// CREAR PRODUCTO
// ======================================================

formProducto.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        // --------------------------------------------------
        // OBTENER VALORES
        // --------------------------------------------------

        const codigoBarras =
            document.getElementById(
                "codigoBarras"
            ).value.trim();


        const nombre =
            document.getElementById(
                "nombre"
            ).value.trim();


        const idCategoria =
            Number(
                document.getElementById(
                    "idCategoria"
                ).value
            );


        const precioCompra =
            Number(
                document.getElementById(
                    "precioCompra"
                ).value
            );


        const precioVenta =
            Number(
                document.getElementById(
                    "precioVenta"
                ).value
            );


        const descripcion =
            document.getElementById(
                "descripcion"
            ).value.trim();


        const stock =
            Number(
                document.getElementById(
                    "stock"
                ).value
            );


        const archivoImagen =
            document.getElementById(
                "imagen"
            ).files[0];


        // ==================================================
        // VALIDACIONES
        // ==================================================


        // --------------------------------------------------
        // CÓDIGO DE BARRAS
        // --------------------------------------------------

        if (
            !/^\d{8,14}$/.test(
                codigoBarras
            )
        ) {

            alert(
                "El código de barras debe contener entre 8 y 14 números."
            );

            return;
        }


        // --------------------------------------------------
        // NOMBRE
        // --------------------------------------------------

        if (
            nombre.length < 2
        ) {

            alert(
                "El nombre del producto debe tener al menos 2 caracteres."
            );

            return;
        }


        // --------------------------------------------------
        // CATEGORÍA
        // --------------------------------------------------

        if (!idCategoria) {

            alert(
                "Debe seleccionar una categoría."
            );

            return;
        }


        // --------------------------------------------------
        // PRECIO COMPRA
        // --------------------------------------------------

        if (
            !Number.isFinite(
                precioCompra
            )
            ||
            precioCompra < 0
        ) {

            alert(
                "El precio de compra no es válido."
            );

            return;
        }


        // --------------------------------------------------
        // PRECIO VENTA
        // --------------------------------------------------

        if (
            !Number.isFinite(
                precioVenta
            )
            ||
            precioVenta < 0
        ) {

            alert(
                "El precio de venta no es válido."
            );

            return;
        }


        // --------------------------------------------------
        // RELACIÓN DE PRECIOS
        // --------------------------------------------------

        if (
            precioVenta <
            precioCompra
        ) {

            alert(
                "El precio de venta no puede ser menor que el precio de compra."
            );

            return;
        }


        // --------------------------------------------------
        // STOCK
        // --------------------------------------------------

        if (
            !Number.isInteger(stock)
            ||
            stock < 0
        ) {

            alert(
                "El stock debe ser un número entero mayor o igual a 0."
            );

            return;
        }


        // --------------------------------------------------
        // DESCRIPCIÓN
        // --------------------------------------------------

        if (
            descripcion.length > 500
        ) {

            alert(
                "La descripción no puede superar los 500 caracteres."
            );

            return;
        }


        // --------------------------------------------------
        // IMAGEN
        // --------------------------------------------------

        if (archivoImagen) {

            const tiposPermitidos = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !tiposPermitidos.includes(
                    archivoImagen.type
                )
            ) {

                alert(
                    "La imagen debe ser JPG, PNG o WEBP."
                );

                return;
            }


            const tamañoMaximo =
                5 * 1024 * 1024;


            if (
                archivoImagen.size >
                tamañoMaximo
            ) {

                alert(
                    "La imagen no puede superar los 5 MB."
                );

                return;
            }

        }


        // ==================================================
        // FORMDATA
        // ==================================================

        const datosFormulario =
            new FormData();


        datosFormulario.append(
            "CodigoBarras",
            codigoBarras
        );


        datosFormulario.append(
            "Nombre",
            nombre
        );


        datosFormulario.append(
            "IdCategoria",
            idCategoria
        );


        datosFormulario.append(
            "PrecioCompra",
            precioCompra
        );


        datosFormulario.append(
            "PrecioVenta",
            precioVenta
        );


        datosFormulario.append(
            "Descripcion",
            descripcion
        );


        datosFormulario.append(
            "Stock",
            stock
        );


        if (archivoImagen) {

            datosFormulario.append(
                "Imagen",
                archivoImagen
            );

        }


        // ==================================================
        // ENVIAR A LA API
        // ==================================================

        try {

            const respuesta =
                await fetch(
                    `${API_URL}/productos`,
                    {
                        method: "POST",
                        body: datosFormulario
                    }
                );


            // --------------------------------------------------
            // ERROR
            // --------------------------------------------------

            if (!respuesta.ok) {

                const datosError =
                    await respuesta.json();

                throw new Error(
                    JSON.stringify(
                        datosError
                    )
                );
            }


            // --------------------------------------------------
            // PRODUCTO CREADO
            // --------------------------------------------------

            const productoCreado =
                await respuesta.json();


            // ==================================================
            // GUARDAR EQUIVALENCIAS
            // ==================================================

            try {

                await guardarEquivalenciasProducto(
                    productoCreado.idProducto
                );

            } catch (errorEquivalencias) {

                console.error(
                    "Error guardando equivalencias:",
                    errorEquivalencias
                );

                alert(
                    "El producto se creó correctamente, " +
                    "pero no se pudieron guardar todas las equivalencias."
                );

                equivalenciasPendientes = [];

                cerrarModalProducto();

                await cargarProductos();

                return;
            }


            console.log(
                "Producto creado:",
                productoCreado
            );


            alert(
                "Producto creado correctamente"
            );


            cerrarModalProducto();


            await cargarProductos();


        } catch (error) {

            console.error(
                "Error creando producto:",
                error
            );


            try {

                const datosError =
                    JSON.parse(
                        error.message
                    );


                if (
                    datosError.mensaje
                ) {

                    alert(
                        datosError.mensaje
                    );

                    return;
                }


            } catch {

                // Error no proveniente de la API

            }


            alert(
                "No se pudo crear el producto"
            );

        }

    }
);