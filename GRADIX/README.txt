GRADIX — Sistema de Seguimiento Académico
==========================================

REQUISITOS
- Java JDK 17 o superior (también funciona en versiones recientes).
- No requiere internet ni librerías externas.

COMPILAR
Abre una terminal dentro de esta carpeta y ejecuta:
    javac *.java

EJECUTAR
    java Gradix

DATOS
El sistema crea gradix_datos.dat en la misma carpeta donde se ejecuta.
No borres ese archivo: contiene los estudiantes y calificaciones.
Haz copias de seguridad periódicas.

FUNCIONES
- Registro de estudiantes y materias.
- Tres parciales de 0 a 10 y créditos por materia.
- Promedio simple y ponderado.
- Aprobación a partir de 6.
- Alertas: reprobación y bajo rendimiento (< 7).
- Consulta, edición y eliminación de materias.
- Reportes y persistencia local.

NOTA ACADÉMICA
La calificación final se calcula como promedio aritmético de los tres parciales.
El promedio ponderado se calcula usando los créditos capturados por materia.
