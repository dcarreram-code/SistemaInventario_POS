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

const btnVolverCategorias =
    document.getElementById(
        "btnVolverCategorias"
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

btnVolverCategorias.addEventListener(
    "click",
    function () {
        btnVolverCategorias.style.display = "none";
        btnCategoriasDesactivadas.style.display = "inline-block";
        cargarCategoriasGestion();
    }
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
    function () {
        btnCategoriasDesactivadas.style.display = "none";
        btnVolverCategorias.style.display = "inline-block";
        cargarCategoriasDesactivadas();
    }
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


