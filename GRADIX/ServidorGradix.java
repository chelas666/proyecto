import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ServidorGradix {

    private static final int PUERTO = 8080;

    private static final GestorDatos gestor = new GestorDatos();

    private static final Object BLOQUEO_DATOS = new Object();

    public static void main(String[] args) throws IOException {

        HttpServer servidor = HttpServer.create(
            new InetSocketAddress(PUERTO), 0
        );

        servidor.createContext("/", ServidorGradix::atenderSolicitud);

        servidor.start();

        System.out.println("-----------------------------------");
        System.out.println("       GRADIX - SERVIDOR WEB");
        System.out.println("-----------------------------------");
        System.out.println("Servidor iniciado correctamente.");
        System.out.println("Dirección: http://localhost:" + PUERTO);
        System.out.println("-----------------------------------");
    }

    private static void atenderSolicitud(HttpExchange intercambio)
            throws IOException {

        String ruta = intercambio.getRequestURI().getPath();

        if (ruta.equals("/api/estudiantes")) {

            String metodo = intercambio.getRequestMethod();

            if (metodo.equals("GET")) {

                List<Estudiante> estudiantes = gestor.cargar();

                String respuesta = convertirEstudiantesJSON(estudiantes);

                responder(
                    intercambio,
                    200,
                    respuesta,
                    "application/json; charset=UTF-8"
                );

                return;
            }

            if (metodo.equals("POST")) {
                registrarEstudiante(intercambio);
                return;
            }

            responder(
                intercambio,
                405,
                "{\"error\":\"Método no permitido\"}",
                "application/json; charset=UTF-8"
            );

            return;
        }

        servirArchivoWeb(intercambio, ruta);
    }

    private static void registrarEstudiante(
            HttpExchange intercambio) throws IOException {

        try {

            byte[] cuerpo = intercambio.getRequestBody().readAllBytes();

            if (cuerpo.length > 1000000) {
                throw new IllegalArgumentException(
                    "El formulario es demasiado grande."
                );
            }

            String datos = new String(
                cuerpo,
                StandardCharsets.UTF_8
            );

            Map<String, String> formulario = convertirFormulario(datos);

            String nombre = formulario.get("nombre");

            if (nombre == null || nombre.trim().isEmpty()) {
                throw new IllegalArgumentException(
                    "Debes escribir el nombre del estudiante."
                );
            }

            nombre = nombre.trim();

            int cantidadMaterias = Integer.parseInt(
                formulario.getOrDefault("cantidadMaterias", "0")
            );

            if (cantidadMaterias < 1 || cantidadMaterias > 100) {
                throw new IllegalArgumentException(
                    "Debes registrar entre 1 y 100 materias."
                );
            }

            synchronized (BLOQUEO_DATOS) {

                List<Estudiante> estudiantes = gestor.cargar();

                for (Estudiante existente : estudiantes) {

                    if (existente.getNombre().equalsIgnoreCase(nombre)) {
                        throw new IllegalArgumentException(
                            "Ya existe un estudiante con ese nombre."
                        );
                    }
                }

                Estudiante nuevo = new Estudiante(nombre);

                for (int i = 0; i < cantidadMaterias; i++) {

                    String nombreMateria = formulario.get("materia" + i);

                    if (nombreMateria == null
                            || nombreMateria.trim().isEmpty()) {

                        throw new IllegalArgumentException(
                            "Debes escribir el nombre de todas las materias."
                        );
                    }

                    double parcial1 = obtenerCalificacion(
                        formulario.get("parcial1_" + i)
                    );

                    double parcial2 = obtenerCalificacion(
                        formulario.get("parcial2_" + i)
                    );

                    double parcial3 = obtenerCalificacion(
                        formulario.get("parcial3_" + i)
                    );

                    if (nuevo.buscarMateria(nombreMateria) != null) {
                        throw new IllegalArgumentException(
                            "No puedes registrar materias repetidas."
                        );
                    }

                    nuevo.getMaterias().add(
                        new Materia(
                            nombreMateria,
                            parcial1,
                            parcial2,
                            parcial3
                        )
                    );
                }

                estudiantes.add(nuevo);

                gestor.guardar(estudiantes);
            }

            responder(
                intercambio,
                201,
                "{\"mensaje\":\"Estudiante registrado correctamente.\"}",
                "application/json; charset=UTF-8"
            );

        } catch (IllegalArgumentException e) {

            responder(
                intercambio,
                400,
                "{\"error\":\"" + escaparJSON(e.getMessage()) + "\"}",
                "application/json; charset=UTF-8"
            );

        } catch (RuntimeException e) {

            responder(
                intercambio,
                500,
                "{\"error\":\"No se pudieron guardar los datos.\"}",
                "application/json; charset=UTF-8"
            );
        }
    }

    private static double obtenerCalificacion(String valor) {

        if (valor == null || valor.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Todas las calificaciones son obligatorias."
            );
        }

        double calificacion;

        try {
            calificacion = Double.parseDouble(valor);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                "Una calificación tiene un formato incorrecto."
            );
        }

        if (!Double.isFinite(calificacion)
                || calificacion < 0
                || calificacion > 10) {

            throw new IllegalArgumentException(
                "Las calificaciones deben estar entre 0 y 10."
            );
        }

        return calificacion;
    }

    private static Map<String, String> convertirFormulario(String datos) {

        Map<String, String> formulario = new HashMap<>();

        if (datos.isEmpty()) {
            throw new IllegalArgumentException(
                "El formulario está vacío."
            );
        }

        String[] campos = datos.split("&");

        for (String campo : campos) {

            String[] partes = campo.split("=", 2);

            String clave = URLDecoder.decode(
                partes[0],
                StandardCharsets.UTF_8
            );

            String valor = partes.length > 1
                ? URLDecoder.decode(partes[1], StandardCharsets.UTF_8)
                : "";

            if (formulario.putIfAbsent(clave, valor) != null) {
                throw new IllegalArgumentException(
                    "El formulario contiene campos repetidos."
                );
            }
        }

        return formulario;
    }

    private static void servirArchivoWeb(
            HttpExchange intercambio, String ruta) throws IOException {

        if (!intercambio.getRequestMethod().equals("GET")) {
            responder(
                intercambio,
                405,
                "Método no permitido",
                "text/plain; charset=UTF-8"
            );
            return;
        }

        if (ruta.equals("/")) {
            ruta = "/index.html";
        }

        Path carpetaWeb = Path.of("web").toAbsolutePath().normalize();

        Path archivo = carpetaWeb.resolve(ruta.substring(1)).normalize();

        if (!archivo.startsWith(carpetaWeb)
                || !Files.isRegularFile(archivo)) {

            responder(
                intercambio,
                404,
                "Archivo no encontrado",
                "text/plain; charset=UTF-8"
            );
            return;
        }

        String tipoContenido = "text/plain; charset=UTF-8";

        if (ruta.endsWith(".html")) {
            tipoContenido = "text/html; charset=UTF-8";
        } else if (ruta.endsWith(".css")) {
            tipoContenido = "text/css; charset=UTF-8";
        } else if (ruta.endsWith(".js")) {
            tipoContenido = "text/javascript; charset=UTF-8";
        }

        byte[] contenido = Files.readAllBytes(archivo);

        intercambio.getResponseHeaders().set(
            "Content-Type", tipoContenido
        );

        intercambio.sendResponseHeaders(200, contenido.length);

        intercambio.getResponseBody().write(contenido);
        intercambio.close();
    }

    private static String convertirEstudiantesJSON(
            List<Estudiante> estudiantes) {

        StringBuilder json = new StringBuilder("[");

        for (int i = 0; i < estudiantes.size(); i++) {

            Estudiante estudiante = estudiantes.get(i);

            if (i > 0) {
                json.append(",");
            }

            json.append("{");

            json.append("\"nombre\":\"")
                .append(escaparJSON(estudiante.getNombre()))
                .append("\",");

            json.append("\"promedio\":")
                .append(estudiante.promedioGeneral())
                .append(",");

            json.append("\"aprobadas\":")
                .append(estudiante.aprobadas())
                .append(",");

            json.append("\"reprobadas\":")
                .append(estudiante.reprobadas())
                .append(",");

            json.append("\"materias\":")
                .append(estudiante.getMaterias().size())
                .append(",");

            json.append("\"detalleMaterias\":[");

            for (int j = 0; j < estudiante.getMaterias().size(); j++) {

                Materia materia = estudiante.getMaterias().get(j);

                if (j > 0) {
                    json.append(",");
                }

                json.append("{");

                json.append("\"nombre\":\"")
                    .append(escaparJSON(materia.getNombre()))
                    .append("\",");

                json.append("\"parcial1\":")
                    .append(materia.getParcial1())
                    .append(",");

                json.append("\"parcial2\":")
                    .append(materia.getParcial2())
                    .append(",");

                json.append("\"parcial3\":")
                    .append(materia.getParcial3())
                    .append(",");

                json.append("\"final\":")
                    .append(materia.getFinal())
                    .append(",");

                json.append("\"estado\":\"")
                    .append(escaparJSON(materia.estado()))
                    .append("\"");

                json.append("}");
            }

            json.append("]}");
        }

        json.append("]");

        return json.toString();
    }

    private static String escaparJSON(String texto) {

        return texto
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private static void responder(
            HttpExchange intercambio,
            int codigo,
            String contenido,
            String tipoContenido) throws IOException {

        byte[] respuesta = contenido.getBytes(StandardCharsets.UTF_8);

        intercambio.getResponseHeaders().set(
            "Content-Type", tipoContenido
        );

        intercambio.sendResponseHeaders(codigo, respuesta.length);

        intercambio.getResponseBody().write(respuesta);
        intercambio.close();
    }
}