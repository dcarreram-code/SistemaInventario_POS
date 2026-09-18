let productos = [];

let textoBusqueda = "";

let categoriaSeleccionada = "";

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


        const ubicacion = [
            producto.bodega,
            producto.estanteria,
            producto.fila
        ].filter(Boolean).join(" | ");

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

            ${ubicacion ? `
                <p class="ubicacion">
                    <strong>Ubicacion:</strong>
                    ${ubicacion}
                </p>
            ` : ""}

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

const editarBodega =
    document.getElementById(
        "editarBodega"
    );

const editarEstanteria =
    document.getElementById(
        "editarEstanteria"
    );

const editarFila =
    document.getElementById(
        "editarFila"
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

        editarBodega.value =
            producto.bodega ?? "";

        editarEstanteria.value =
            producto.estanteria ?? "";

        editarFila.value =
            producto.fila ?? "";

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

        const bodega =
            editarBodega.value.trim();

        const estanteria =
            editarEstanteria.value.trim();

        const fila =
            editarFila.value.trim();

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

        datosFormulario.append(
            "Bodega",
            bodega
        );

        datosFormulario.append(
            "Estanteria",
            estanteria
        );

        datosFormulario.append(
            "Fila",
            fila
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


        const ubicacion = [
            producto.bodega,
            producto.estanteria,
            producto.fila
        ].filter(Boolean).join(" | ");

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

            ${ubicacion ? `
                <p class="ubicacion">
                    <strong>Ubicacion:</strong>
                    ${ubicacion}
                </p>
            ` : ""}

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


        // Regresar automáticamente a la vista normal
        btnVolverProductos.style.display = "none";
        btnProductosDesactivados.style.display = "inline-block";

        textoBusqueda = "";
        categoriaSeleccionada = "";
        buscarProducto.value = "";
        filtroCategoria.value = "";

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

const btnVolverProductos =
    document.getElementById(
        "btnVolverProductos"
    );

btnProductosDesactivados.addEventListener(
    "click",
    function () {
        btnProductosDesactivados.style.display = "none";
        btnVolverProductos.style.display = "inline-block";

        textoBusqueda = "";
        categoriaSeleccionada = "";
        buscarProducto.value = "";
        filtroCategoria.value = "";

        cargarProductosDesactivados();
    }
);

btnVolverProductos.addEventListener(
    "click",
    function () {
        btnVolverProductos.style.display = "none";
        btnProductosDesactivados.style.display = "inline-block";

        textoBusqueda = "";
        categoriaSeleccionada = "";
        buscarProducto.value = "";
        filtroCategoria.value = "";

        cargarProductos();
    }
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

        const bodega =
            document.getElementById(
                "bodega"
            ).value.trim();

        const estanteria =
            document.getElementById(
                "estanteria"
            ).value.trim();

        const fila =
            document.getElementById(
                "fila"
            ).value.trim();


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

        datosFormulario.append(
            "Bodega",
            bodega
        );

        datosFormulario.append(
            "Estanteria",
            estanteria
        );

        datosFormulario.append(
            "Fila",
            fila
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
