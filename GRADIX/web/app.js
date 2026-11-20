/* ==========================================
   GRADIX - SISTEMA DE GESTIÓN ACADÉMICA
========================================== */

// DATOS GENERALES

let estudiantesRegistrados = [];
let contadorMaterias = 0;

// ==========================================
// CARGAR ESTUDIANTES DESDE JAVA
// ==========================================

async function cargarEstudiantes() {
    try {
        const respuesta = await fetch("/api/estudiantes");

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar los estudiantes.");
        }

        const estudiantes = await respuesta.json();

        estudiantesRegistrados = estudiantes;

        console.log("Estudiantes recibidos desde Java:", estudiantes);

        actualizarEstadisticas(estudiantes);
        mostrarEstudiantes(estudiantes);
        actualizarSelectorEstudiantes(estudiantes);
        actualizarRendimiento(estudiantes);
        actualizarSelectorReportes(estudiantes);

    } catch (error) {
        console.error("Error al conectar con GRADIX:", error);

        document.getElementById("tabla-estudiantes").textContent =
            "No se pudieron cargar los estudiantes.";

        document.getElementById("alertas-rendimiento").textContent =
            "No se pudo cargar la información académica.";

        document.getElementById("vista-previa-reporte").textContent =
            "No se pudieron cargar los datos para generar reportes.";

        document.getElementById("imprimir-reporte").hidden = true;
    }
}

// ==========================================
// ESTADÍSTICAS DEL PANEL PRINCIPAL
// ==========================================

function actualizarEstadisticas(estudiantes) {

    const tarjetas = document.querySelectorAll(
        "#inicio .estadisticas .tarjeta h3"
    );

    const cantidad = estudiantes.length;

    const promedio = cantidad > 0
        ? estudiantes.reduce(
            (suma, estudiante) => suma + estudiante.promedio, 0
        ) / cantidad
        : 0;

    const materias = estudiantes.reduce(
        (total, estudiante) => total + estudiante.materias,
        0
    );

    tarjetas[0].textContent = cantidad;
    tarjetas[1].textContent = promedio.toFixed(2);
    tarjetas[2].textContent = materias;
}

// ==========================================
// CREAR TABLAS
// ==========================================

function crearTabla(columnas, filas, clase = "tabla-academica") {

    const tabla = document.createElement("table");
    tabla.className = clase;

    const encabezado = document.createElement("thead");
    const filaEncabezado = document.createElement("tr");

    columnas.forEach(columna => {
        const th = document.createElement("th");
        th.textContent = columna;
        filaEncabezado.appendChild(th);
    });

    encabezado.appendChild(filaEncabezado);
    tabla.appendChild(encabezado);

    const cuerpo = document.createElement("tbody");

    filas.forEach(datos => {

        const fila = document.createElement("tr");

        datos.forEach(dato => {
            const td = document.createElement("td");
            td.textContent = dato;
            fila.appendChild(td);
        });

        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);

    return tabla;
}

// ==========================================
// DIRECTORIO DE ESTUDIANTES
// ==========================================

function mostrarEstudiantes(estudiantes) {

    const contenedor = document.getElementById("tabla-estudiantes");

    if (estudiantes.length === 0) {
        contenedor.textContent = "No hay estudiantes registrados.";
        return;
    }

    const columnas = [
        "Nombre",
        "Promedio",
        "Aprobadas",
        "Reprobadas",
        "Materias"
    ];

    const filas = estudiantes.map(estudiante => [
        estudiante.nombre,
        estudiante.promedio.toFixed(2),
        estudiante.aprobadas,
        estudiante.reprobadas,
        estudiante.materias
    ]);

    contenedor.replaceChildren(crearTabla(columnas, filas));
}

// ==========================================
// SELECTORES DE ESTUDIANTES
// ==========================================

function llenarSelector(id, estudiantes) {

    const selector = document.getElementById(id);

    if (!selector) {
        return;
    }

    selector.replaceChildren();

    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = "Selecciona un estudiante";

    selector.appendChild(inicial);

    estudiantes.forEach((estudiante, indice) => {

        const opcion = document.createElement("option");

        opcion.value = indice;
        opcion.textContent = estudiante.nombre;

        selector.appendChild(opcion);
    });
}

function actualizarSelectorEstudiantes(estudiantes) {

    llenarSelector("seleccionar-estudiante", estudiantes);

    document.getElementById("informacion-estudiante").textContent =
        "Selecciona un estudiante para consultar sus materias.";

    document.getElementById("tabla-materias").replaceChildren();
}

// ==========================================
// HISTORIAL DE MATERIAS
// ==========================================

function mostrarMateriasEstudiante(indice) {

    const informacion = document.getElementById("informacion-estudiante");
    const contenedor = document.getElementById("tabla-materias");

    if (indice === "") {

        informacion.textContent =
            "Selecciona un estudiante para consultar sus materias.";

        contenedor.replaceChildren();
        return;
    }

    const estudiante = estudiantesRegistrados[Number(indice)];

    if (!estudiante) {
        return;
    }

    informacion.textContent =
        "Estudiante: " + estudiante.nombre +
        " | Promedio general: " + estudiante.promedio.toFixed(2) +
        " | Total de materias: " + estudiante.materias;

    const materias = estudiante.detalleMaterias || [];

    if (materias.length === 0) {
        contenedor.textContent =
            "Este estudiante no tiene materias registradas.";
        return;
    }

    const columnas = [
        "Materia",
        "Parcial 1",
        "Parcial 2",
        "Parcial 3",
        "Final",
        "Estado"
    ];

    const filas = materias.map(materia => [
        materia.nombre,
        materia.parcial1.toFixed(1),
        materia.parcial2.toFixed(1),
        materia.parcial3.toFixed(1),
        materia.final.toFixed(2),
        materia.estado
    ]);

    const tabla = crearTabla(columnas, filas);

    tabla.querySelectorAll("tbody tr").forEach((fila, indiceFila) => {

        const celda = fila.lastElementChild;

        celda.style.fontWeight = "600";

        celda.style.color = materias[indiceFila].estado === "APROBADA"
            ? "#198754"
            : "#C8102E";
    });

    contenedor.replaceChildren(tabla);
}

// ==========================================
// RENDIMIENTO GENERAL
// ==========================================

function actualizarRendimiento(estudiantes) {

    const cantidad = estudiantes.length;

    const promedio = cantidad > 0
        ? estudiantes.reduce(
            (suma, estudiante) => suma + estudiante.promedio, 0
        ) / cantidad
        : 0;

    const aprobadas = estudiantes.reduce(
        (total, estudiante) => total + estudiante.aprobadas,
        0
    );

    const reprobadas = estudiantes.reduce(
        (total, estudiante) => total + estudiante.reprobadas,
        0
    );

    document.getElementById("rendimiento-promedio").textContent =
        promedio.toFixed(2);

    document.getElementById("rendimiento-aprobadas").textContent =
        aprobadas;

    document.getElementById("rendimiento-reprobadas").textContent =
        reprobadas;

    llenarSelector("rendimiento-estudiante", estudiantes);

    document.getElementById("resumen-rendimiento").textContent =
        "Selecciona un estudiante para consultar su rendimiento académico.";

    mostrarAlertasRendimiento(estudiantes);
}

// ==========================================
// RENDIMIENTO INDIVIDUAL
// ==========================================

function mostrarRendimientoEstudiante(indice) {

    const contenedor = document.getElementById("resumen-rendimiento");

    contenedor.replaceChildren();

    if (indice === "") {
        contenedor.textContent =
            "Selecciona un estudiante para consultar su rendimiento académico.";
        return;
    }

    const estudiante = estudiantesRegistrados[Number(indice)];

    if (!estudiante) {
        return;
    }

    const titulo = document.createElement("h3");
    titulo.textContent = estudiante.nombre;
    titulo.style.color = "#003B71";
    titulo.style.marginBottom = "15px";

    contenedor.appendChild(titulo);

    const datos = [
        ["Promedio general", estudiante.promedio.toFixed(2)],
        ["Materias registradas", estudiante.materias],
        ["Materias aprobadas", estudiante.aprobadas],
        ["Materias reprobadas", estudiante.reprobadas]
    ];

    datos.forEach(([etiqueta, valor]) => {

        const parrafo = document.createElement("p");
        const negrita = document.createElement("strong");

        negrita.textContent = etiqueta + ": ";

        parrafo.appendChild(negrita);
        parrafo.appendChild(document.createTextNode(valor));

        contenedor.appendChild(parrafo);
    });

    const estado = document.createElement("p");

    estado.style.marginTop = "15px";
    estado.style.fontWeight = "600";

    if (estudiante.materias === 0) {
        estado.textContent = "Sin materias registradas";
        estado.style.color = "#526174";

    } else if (estudiante.promedio < 7) {
        estado.textContent =
            "Atención: estudiante con bajo rendimiento académico";
        estado.style.color = "#C8102E";

    } else {
        estado.textContent = "Rendimiento académico satisfactorio";
        estado.style.color = "#198754";
    }

    contenedor.appendChild(estado);

    const materiasBajas = (estudiante.detalleMaterias || [])
        .filter(materia => materia.final < 7);

    if (materiasBajas.length > 0) {

        const subtitulo = document.createElement("h4");

        subtitulo.textContent = "Materias que requieren atención";
        subtitulo.style.marginTop = "20px";
        subtitulo.style.color = "#003B71";

        contenedor.appendChild(subtitulo);

        materiasBajas.forEach(materia => {

            const parrafo = document.createElement("p");

            parrafo.textContent =
                materia.nombre + " - Calificación: " +
                materia.final.toFixed(2);

            parrafo.style.color = "#C8102E";

            contenedor.appendChild(parrafo);
        });
    }
}

// ==========================================
// ALERTAS DE RENDIMIENTO
// ==========================================

function mostrarAlertasRendimiento(estudiantes) {

    const contenedor = document.getElementById("alertas-rendimiento");

    contenedor.replaceChildren();

    if (estudiantes.length === 0) {
        contenedor.textContent = "No hay estudiantes registrados.";
        return;
    }

    const estudiantesEnRiesgo = estudiantes.filter(
        estudiante => estudiante.materias > 0 &&
                      estudiante.promedio < 7
    );

    const estudiantesConReprobadas = estudiantes.filter(
        estudiante => estudiante.reprobadas > 0
    );

    const titulo = document.createElement("h3");
    titulo.textContent = "Resumen de seguimiento";
    titulo.style.color = "#003B71";
    titulo.style.marginBottom = "15px";

    contenedor.appendChild(titulo);

    const resumen = document.createElement("p");

    resumen.textContent =
        "Estudiantes con promedio inferior a 7: " +
        estudiantesEnRiesgo.length +
        " | Estudiantes con materias reprobadas: " +
        estudiantesConReprobadas.length;

    contenedor.appendChild(resumen);

    if (estudiantesEnRiesgo.length === 0 &&
        estudiantesConReprobadas.length === 0) {

        const mensaje = document.createElement("p");

        mensaje.textContent = "No se detectaron alertas académicas.";
        mensaje.style.color = "#198754";
        mensaje.style.fontWeight = "600";
        mensaje.style.marginTop = "15px";

        contenedor.appendChild(mensaje);
        return;
    }

    estudiantes.forEach(estudiante => {

        const promedioBajo =
            estudiante.materias > 0 && estudiante.promedio < 7;

        const tieneReprobadas = estudiante.reprobadas > 0;

        if (!promedioBajo && !tieneReprobadas) {
            return;
        }

        const alerta = document.createElement("div");

        alerta.style.background = "#FFFFFF";
        alerta.style.borderLeft = "4px solid #C8102E";
        alerta.style.padding = "15px";
        alerta.style.marginTop = "15px";
        alerta.style.borderRadius = "7px";

        const nombre = document.createElement("strong");
        nombre.textContent = estudiante.nombre;
        nombre.style.color = "#003B71";

        alerta.appendChild(nombre);

        const promedio = document.createElement("p");
        promedio.textContent =
            "Promedio general: " + estudiante.promedio.toFixed(2);

        alerta.appendChild(promedio);

        if (promedioBajo) {

            const aviso = document.createElement("p");
            aviso.textContent = "Promedio inferior a 7";
            aviso.style.color = "#C8102E";

            alerta.appendChild(aviso);
        }

        if (tieneReprobadas) {

            const aviso = document.createElement("p");

            aviso.textContent =
                "Materias reprobadas: " + estudiante.reprobadas;

            aviso.style.color = "#C8102E";

            alerta.appendChild(aviso);
        }

        contenedor.appendChild(alerta);
    });
}

// ==========================================
// REPORTES - SELECTOR
// ==========================================

function actualizarSelectorReportes(estudiantes) {

    llenarSelector("estudiante-reporte", estudiantes);

    document.getElementById("vista-previa-reporte").textContent =
        "Selecciona el tipo de reporte y presiona Generar reporte.";

    document.getElementById("imprimir-reporte").hidden = true;
}

// ==========================================
// REPORTES - CAMBIAR TIPO
// ==========================================

function cambiarTipoReporte() {

    const tipo = document.getElementById("tipo-reporte").value;

    const campo = document.getElementById("campo-estudiante-reporte");

    campo.hidden = tipo === "general";

    document.getElementById("vista-previa-reporte").textContent =
        "Presiona Generar reporte para visualizar el documento.";

    document.getElementById("imprimir-reporte").hidden = true;
}

// ==========================================
// REPORTES - CREAR DOCUMENTO
// ==========================================

function crearDocumentoReporte(titulo) {

    const documento = document.createElement("article");
    documento.className = "documento-reporte";

    const encabezado = document.createElement("header");
    encabezado.className = "reporte-encabezado";

    const nombre = document.createElement("h2");
    nombre.textContent = "GRADIX";

    const descripcion = document.createElement("p");
    descripcion.textContent = "Sistema de Gestión Académica";

    encabezado.appendChild(nombre);
    encabezado.appendChild(descripcion);

    documento.appendChild(encabezado);

    const tituloDocumento = document.createElement("h3");
    tituloDocumento.className = "reporte-titulo";
    tituloDocumento.textContent = titulo;

    documento.appendChild(tituloDocumento);

    const fecha = document.createElement("div");
    fecha.className = "reporte-datos";

    const fechaActual = new Date().toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    agregarDato(fecha, "Fecha de emisión", fechaActual);

    documento.appendChild(fecha);

    return documento;
}

// ==========================================
// REPORTES - AGREGAR DATOS
// ==========================================

function agregarDato(contenedor, etiqueta, valor) {

    const parrafo = document.createElement("p");
    const negrita = document.createElement("strong");

    negrita.textContent = etiqueta + ": ";

    parrafo.appendChild(negrita);
    parrafo.appendChild(document.createTextNode(String(valor)));

    contenedor.appendChild(parrafo);
}

// ==========================================
// REPORTES - OBSERVACIONES
// ==========================================

function agregarObservaciones(documento, mensajes) {

    const seccion = document.createElement("section");
    seccion.className = "reporte-observaciones";

    const titulo = document.createElement("strong");
    titulo.textContent = "Observaciones académicas";

    seccion.appendChild(titulo);

    mensajes.forEach(mensaje => {

        const parrafo = document.createElement("p");
        parrafo.textContent = mensaje;

        seccion.appendChild(parrafo);
    });

    documento.appendChild(seccion);
}

// ==========================================
// REPORTES - FIRMA
// ==========================================

function agregarFirma(documento) {

    const firma = document.createElement("footer");
    firma.className = "reporte-firma";

    const linea = document.createElement("div");
    linea.className = "linea-firma";

    const texto = document.createElement("p");
    texto.textContent = "Firma del responsable académico";

    firma.appendChild(linea);
    firma.appendChild(texto);

    documento.appendChild(firma);
}

// ==========================================
// REPORTE INDIVIDUAL
// ==========================================

function crearReporteIndividual(estudiante) {

    const documento = crearDocumentoReporte(
        "REPORTE ACADÉMICO INDIVIDUAL"
    );

    const datos = document.createElement("section");
    datos.className = "reporte-datos";

    agregarDato(datos, "Estudiante", estudiante.nombre);
    agregarDato(datos, "Promedio general", estudiante.promedio.toFixed(2));
    agregarDato(datos, "Materias registradas", estudiante.materias);
    agregarDato(datos, "Materias aprobadas", estudiante.aprobadas);
    agregarDato(datos, "Materias reprobadas", estudiante.reprobadas);

    documento.appendChild(datos);

    const materias = estudiante.detalleMaterias || [];

    if (materias.length > 0) {

        const columnas = [
            "Materia",
            "P1",
            "P2",
            "P3",
            "Final",
            "Estado"
        ];

        const filas = materias.map(materia => [
            materia.nombre,
            materia.parcial1.toFixed(1),
            materia.parcial2.toFixed(1),
            materia.parcial3.toFixed(1),
            materia.final.toFixed(2),
            materia.estado
        ]);

        documento.appendChild(
            crearTabla(columnas, filas, "reporte-tabla")
        );

    } else {

        const aviso = document.createElement("p");
        aviso.textContent = "Sin materias registradas.";

        documento.appendChild(aviso);
    }

    const observaciones = [];

    if (estudiante.materias === 0) {

        observaciones.push(
            "No hay suficientes datos para evaluar el rendimiento."
        );

    } else if (estudiante.promedio < 7) {

        observaciones.push(
            "El estudiante presenta un promedio inferior a 7."
        );

    } else {

        observaciones.push(
            "El estudiante presenta un promedio general de " +
            estudiante.promedio.toFixed(2) + "."
        );
    }

    if (estudiante.reprobadas > 0) {

        observaciones.push(
            "Se identificaron " + estudiante.reprobadas +
            " materias reprobadas."
        );
    }

    const materiasBajas = materias.filter(
        materia => materia.final < 7
    );

    if (materiasBajas.length > 0) {

        observaciones.push(
            "Materias que requieren seguimiento: " +
            materiasBajas.map(materia => materia.nombre).join(", ") + "."
        );
    }

    agregarObservaciones(documento, observaciones);
    agregarFirma(documento);

    return documento;
}

// ==========================================
// REPORTE GENERAL
// ==========================================

function crearReporteGeneral(estudiantes) {

    const documento = crearDocumentoReporte(
        "REPORTE ACADÉMICO GENERAL"
    );

    const cantidad = estudiantes.length;

    const promedio = cantidad > 0
        ? estudiantes.reduce(
            (suma, estudiante) => suma + estudiante.promedio, 0
        ) / cantidad
        : 0;

    const aprobadas = estudiantes.reduce(
        (total, estudiante) => total + estudiante.aprobadas,
        0
    );

    const reprobadas = estudiantes.reduce(
        (total, estudiante) => total + estudiante.reprobadas,
        0
    );

    const datos = document.createElement("section");
    datos.className = "reporte-datos";

    agregarDato(datos, "Total de estudiantes", cantidad);
    agregarDato(datos, "Promedio académico general", promedio.toFixed(2));
    agregarDato(datos, "Materias aprobadas", aprobadas);
    agregarDato(datos, "Materias reprobadas", reprobadas);

    documento.appendChild(datos);

    if (cantidad > 0) {

        const columnas = [
            "Estudiante",
            "Promedio",
            "Aprobadas",
            "Reprobadas",
            "Materias"
        ];

        const filas = estudiantes.map(estudiante => [
            estudiante.nombre,
            estudiante.promedio.toFixed(2),
            estudiante.aprobadas,
            estudiante.reprobadas,
            estudiante.materias
        ]);

        documento.appendChild(
            crearTabla(columnas, filas, "reporte-tabla")
        );

    } else {

        const aviso = document.createElement("p");
        aviso.textContent = "No hay estudiantes registrados.";

        documento.appendChild(aviso);
    }

    const observaciones = [];

    const promedioBajo = estudiantes.filter(
        estudiante => estudiante.materias > 0 &&
                      estudiante.promedio < 7
    );

    const conReprobadas = estudiantes.filter(
        estudiante => estudiante.reprobadas > 0
    );

    observaciones.push(
        "Estudiantes con promedio inferior a 7: " +
        promedioBajo.length + "."
    );

    observaciones.push(
        "Estudiantes con materias reprobadas: " +
        conReprobadas.length + "."
    );

    if (conReprobadas.length > 0) {

        observaciones.push(
            "Estudiantes que requieren seguimiento: " +
            conReprobadas.map(e => e.nombre).join(", ") + "."
        );
    }

    agregarObservaciones(documento, observaciones);
    agregarFirma(documento);

    return documento;
}

// ==========================================
// GENERAR REPORTE
// ==========================================

function generarReporte() {

    const tipo = document.getElementById("tipo-reporte").value;

    const indice = document.getElementById("estudiante-reporte").value;

    const vista = document.getElementById("vista-previa-reporte");

    const botonImprimir = document.getElementById("imprimir-reporte");

    vista.replaceChildren();
    botonImprimir.hidden = true;

    if (tipo === "individual") {

        if (indice === "") {
            alert("Selecciona un estudiante.");
            return;
        }

        const estudiante = estudiantesRegistrados[Number(indice)];

        if (!estudiante) {
            alert("No se encontró el estudiante seleccionado.");
            return;
        }

        vista.appendChild(crearReporteIndividual(estudiante));

    } else if (tipo === "general") {

        vista.appendChild(crearReporteGeneral(estudiantes));

    } else {

        alert("Selecciona un tipo de reporte válido.");
        return;
    }

    botonImprimir.hidden = false;
}

// ==========================================
// IMPRIMIR O GUARDAR COMO PDF
// ==========================================

function imprimirReporte() {

    const documento = document.querySelector(
        "#vista-previa-reporte .documento-reporte"
    );

    if (!documento) {
        alert("Primero debes generar un reporte.");
        return;
    }

    window.print();
}

// ==========================================
// NAVEGACIÓN
// ==========================================

function mostrarSeccion(seccionSeleccionada) {

    document.querySelectorAll(".vista").forEach(vista => {
        vista.hidden = true;
    });

    const vista = document.getElementById(seccionSeleccionada);

    if (vista) {
        vista.hidden = false;
    }

    document.querySelectorAll(".menu-lateral nav a").forEach(enlace => {

        enlace.classList.toggle(
            "activo",
            enlace.dataset.seccion === seccionSeleccionada
        );
    });
}

function configurarNavegacion() {

    document.querySelectorAll(".menu-lateral nav a")
        .forEach(enlace => {

            enlace.addEventListener("click", function(event) {

                event.preventDefault();

                mostrarSeccion(this.dataset.seccion);
            });
        });

    document.querySelectorAll(".acceso[data-ir-a]")
        .forEach(acceso => {

            acceso.addEventListener("click", function() {

                mostrarSeccion(this.dataset.irA);
            });
        });
}

// ==========================================
// AGREGAR MATERIAS DINÁMICAMENTE
// ==========================================

function agregarMateria() {

    contadorMaterias++;

    const lista = document.getElementById("lista-materias");

    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta-materia");

    tarjeta.innerHTML = `
        <div class="encabezado-tarjeta-materia">
            <h4>Materia ${contadorMaterias}</h4>

            <button type="button" class="eliminar-materia">
                Eliminar
            </button>
        </div>

        <div class="campo-materia">
            <label>Nombre de la materia</label>
            <input
                type="text"
                class="nombre-materia"
                placeholder="Ej. Programación"
                required
            >
        </div>

        <div class="campos-calificaciones">

            <div class="campo-materia">
                <label>Parcial 1</label>
                <input
                    type="number"
                    class="parcial1"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="0 - 10"
                    required
                >
            </div>

            <div class="campo-materia">
                <label>Parcial 2</label>
                <input
                    type="number"
                    class="parcial2"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="0 - 10"
                    required
                >
            </div>

            <div class="campo-materia">
                <label>Parcial 3</label>
                <input
                    type="number"
                    class="parcial3"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="0 - 10"
                    required
                >
            </div>

        </div>
    `;

    tarjeta.querySelector(".eliminar-materia")
        .addEventListener("click", function() {

            tarjeta.remove();
        });

    lista.appendChild(tarjeta);
}

// ==========================================
// REGISTRAR ESTUDIANTE EN JAVA
// ==========================================

async function registrarEstudiante(event) {

    event.preventDefault();

    const formulario = document.getElementById("formulario-estudiante");

    const nombre = document.getElementById("nombre-estudiante").value.trim();

    const tarjetas = document.querySelectorAll(".tarjeta-materia");

    if (tarjetas.length === 0) {
        alert("Debes agregar al menos una materia.");
        return;
    }

    const datos = new URLSearchParams();

    datos.append("nombre", nombre);
    datos.append("cantidadMaterias", tarjetas.length);

    tarjetas.forEach((tarjeta, indice) => {

        datos.append(
            "materia" + indice,
            tarjeta.querySelector(".nombre-materia").value.trim()
        );

        datos.append(
            "parcial1_" + indice,
            tarjeta.querySelector(".parcial1").value
        );

        datos.append(
            "parcial2_" + indice,
            tarjeta.querySelector(".parcial2").value
        );

        datos.append(
            "parcial3_" + indice,
            tarjeta.querySelector(".parcial3").value
        );
    });

    const boton = document.getElementById("registrar-estudiante");

    boton.disabled = true;
    boton.textContent = "Registrando...";

    try {

        const respuesta = await fetch("/api/estudiantes", {

            method: "POST",

            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },

            body: datos.toString()
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo registrar el estudiante."
            );
        }

        alert(resultado.mensaje);

        formulario.reset();

        document.getElementById("lista-materias").replaceChildren();

        contadorMaterias = 0;

        await cargarEstudiantes();

    } catch (error) {

        console.error("Error al registrar estudiante:", error);

        alert(error.message);

    } finally {

        boton.disabled = false;
        boton.textContent = "Registrar estudiante";
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    configurarNavegacion();

    document.getElementById("agregar-materia")
        .addEventListener("click", agregarMateria);

    document.getElementById("formulario-estudiante")
        .addEventListener("submit", registrarEstudiante);

    document.getElementById("seleccionar-estudiante")
        .addEventListener("change", function() {

            mostrarMateriasEstudiante(this.value);
        });

    document.getElementById("rendimiento-estudiante")
        .addEventListener("change", function() {

            mostrarRendimientoEstudiante(this.value);
        });

    document.getElementById("tipo-reporte")
        .addEventListener("change", cambiarTipoReporte);

    document.getElementById("generar-reporte")
        .addEventListener("click", generarReporte);

    document.getElementById("imprimir-reporte")
        .addEventListener("click", imprimirReporte);

    cambiarTipoReporte();

    cargarEstudiantes();
});