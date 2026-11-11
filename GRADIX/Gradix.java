import java.util.*;
import java.io.*;

public class Gradix {
    private static final Scanner sc=new Scanner(System.in);
    private static final GestorDatos almacenamiento=new GestorDatos();
    private static List<Estudiante> estudiantes=almacenamiento.cargar();

    public static void main(String[] args){
        System.out.println("╔══════════════════════════════════════════════╗");
        System.out.println("║              GRADIX | ACADÉMICO             ║");
        System.out.println("║        Sistema de Seguimiento Académico     ║");
        System.out.println("╚══════════════════════════════════════════════╝");
        boolean salir=false;
        while(!salir){
            System.out.println("\\n========== MENÚ PRINCIPAL ==========");
            System.out.println("1. Registrar estudiante y materias");
            System.out.println("2. Consultar y actualizar registros");
            System.out.println("3. Consultar rendimiento académico");
            System.out.println("4. Generar reporte y alertas");
            System.out.println("5. Salir");
            int op=entero("Selecciona una opción: ",1,5);
            try{
                switch(op){
                    case 1 -> registrar();
                    case 2 -> actualizar();
                    case 3 -> rendimiento();
                    case 4 -> reporte();
                    case 5 -> {guardar(); salir=true; System.out.println("Datos guardados. ¡Hasta pronto!");}
                }
            }catch(RuntimeException e){System.out.println("Error: "+e.getMessage());}
        }
    }
    private static void registrar(){
        System.out.println("\\n--- REGISTRO DE ESTUDIANTE ---");
        String nombre=texto("Nombre completo: ");
        if(buscarEstudiante(nombre)!=null){System.out.println("Ya existe un estudiante con ese nombre.");return;}
        Estudiante e=new Estudiante(nombre);
        int n=entero("Cantidad de materias: ",1,100);
        for(int i=0;i<n;i++){
            System.out.println("\\nMateria "+(i+1)+" de "+n);
            Materia m=crearMateria(e);
            e.getMaterias().add(m);
        }
        estudiantes.add(e); guardar();
        System.out.println("Estudiante registrado y guardado correctamente.");
    }
    private static Materia crearMateria(Estudiante e){
        String nombre;
        do{
            nombre=texto("Nombre de la materia: ");
            if(e.buscarMateria(nombre)!=null) System.out.println("Esa materia ya está registrada para este estudiante.");
        }while(e.buscarMateria(nombre)!=null);
        int creditos=entero("Créditos de la materia (1-20): ",1,20);
        double p1=decimal("Parcial 1 (0-10): ",0,10);
        double p2=decimal("Parcial 2 (0-10): ",0,10);
        double p3=decimal("Parcial 3 (0-10): ",0,10);
        return new Materia(nombre,p1,p2,p3,creditos);
    }
    private static void actualizar(){
        Estudiante e=seleccionarEstudiante(); if(e==null)return;
        boolean volver=false;
        while(!volver){
            System.out.println("\\n--- ACTUALIZAR: "+e.getNombre()+" ---");
            System.out.println("1. Cambiar nombre del estudiante");
            System.out.println("2. Agregar materia");
            System.out.println("3. Modificar calificaciones/créditos");
            System.out.println("4. Renombrar materia");
            System.out.println("5. Eliminar materia");
            System.out.println("6. Ver expediente");
            System.out.println("7. Volver");
            switch(entero("Opción: ",1,7)){
                case 1->{String nuevo=texto("Nuevo nombre: "); Estudiante otro=buscarEstudiante(nuevo);
                    if(otro!=null&&otro!=e)System.out.println("Ese nombre ya está registrado.");
                    else{e.setNombre(nuevo);guardar();System.out.println("Nombre actualizado.");}}
                case 2->{Materia m=crearMateria(e);e.getMaterias().add(m);guardar();System.out.println("Materia agregada.");}
                case 3->{Materia m=seleccionarMateria(e);if(m!=null){
                    double p1=decimal("Parcial 1 (0-10): ",0,10),p2=decimal("Parcial 2 (0-10): ",0,10),p3=decimal("Parcial 3 (0-10): ",0,10);
                    int c=entero("Créditos (1-20): ",1,20);m.setParciales(p1,p2,p3);m.setCreditos(c);guardar();System.out.println("Registro actualizado.");}}
                case 4->{Materia m=seleccionarMateria(e);if(m!=null){String nuevo=texto("Nuevo nombre: ");
                    if(e.buscarMateria(nuevo)!=null)System.out.println("Ya existe esa materia.");
                    else{m.setNombre(nuevo);guardar();System.out.println("Materia renombrada.");}}}
                case 5->{Materia m=seleccionarMateria(e);if(m!=null&&confirmar("¿Eliminar "+m.getNombre()+"? (S/N): ")){
                    e.getMaterias().remove(m);guardar();System.out.println("Materia eliminada.");}}
                case 6->mostrarExpediente(e);
                case 7->volver=true;
            }
        }
    }
    private static void rendimiento(){
        Estudiante e=seleccionarEstudiante();if(e!=null)mostrarExpediente(e);
    }
    private static void reporte(){
        Estudiante e=seleccionarEstudiante();if(e==null)return;
        System.out.println("\\n========== REPORTE GRADIX ==========");
        mostrarExpediente(e);
        System.out.println("\\nALERTAS:");
        boolean alerta=false;
        for(Materia m:e.getMaterias()){
            if(!m.aprobada()){System.out.printf(" [REPROBADA] %s: %.2f%n",m.getNombre(),m.getFinal());alerta=true;}
            else if(m.bajoRendimiento()){System.out.printf(" [BAJO RENDIMIENTO] %s: %.2f%n",m.getNombre(),m.getFinal());alerta=true;}
        }
        if(!alerta)System.out.println("Sin alertas académicas. ¡Buen desempeño!");
        System.out.println("==================================");
    }
    private static void mostrarExpediente(Estudiante e){
        System.out.println("\\nESTUDIANTE: "+e.getNombre());
        if(e.getMaterias().isEmpty()){System.out.println("Sin materias registradas.");return;}
        System.out.println("--------------------------------------------------------------------------");
        System.out.printf("%-22s %6s %6s %6s %7s %8s %s%n","MATERIA","P1","P2","P3","FINAL","CRÉDITOS","ESTADO");
        System.out.println("--------------------------------------------------------------------------");
        for(Materia m:e.getMaterias())
            System.out.printf(Locale.US,"%-22s %6.2f %6.2f %6.2f %7.2f %8d %s%n",
                limitar(m.getNombre(),22),m.getParcial1(),m.getParcial2(),m.getParcial3(),m.getFinal(),m.getCreditos(),m.estado());
        System.out.println("--------------------------------------------------------------------------");
        System.out.printf(Locale.US,"Promedio general: %.2f | Promedio ponderado: %.2f%n",e.promedioGeneral(),e.promedioPonderado());
        System.out.println("Aprobadas: "+e.aprobadas()+" | Reprobadas: "+e.reprobadas());
        Materia max=Collections.max(e.getMaterias(),Comparator.comparingDouble(Materia::getFinal));
        Materia min=Collections.min(e.getMaterias(),Comparator.comparingDouble(Materia::getFinal));
        System.out.printf(Locale.US,"Más alta: %s (%.2f) | Más baja: %s (%.2f)%n",max.getNombre(),max.getFinal(),min.getNombre(),min.getFinal());
    }
    private static Estudiante seleccionarEstudiante(){
        if(estudiantes.isEmpty()){System.out.println("No hay estudiantes registrados.");return null;}
        System.out.println("\\nESTUDIANTES:");
        for(int i=0;i<estudiantes.size();i++)System.out.println((i+1)+". "+estudiantes.get(i).getNombre());
        int op=entero("Selecciona estudiante (0 para cancelar): ",0,estudiantes.size());
        return op==0?null:estudiantes.get(op-1);
    }
    private static Materia seleccionarMateria(Estudiante e){
        if(e.getMaterias().isEmpty()){System.out.println("No hay materias registradas.");return null;}
        for(int i=0;i<e.getMaterias().size();i++)System.out.println((i+1)+". "+e.getMaterias().get(i).getNombre());
        int op=entero("Selecciona materia (0 para cancelar): ",0,e.getMaterias().size());
        return op==0?null:e.getMaterias().get(op-1);
    }
    private static Estudiante buscarEstudiante(String nombre){
        return estudiantes.stream().filter(e->e.getNombre().equalsIgnoreCase(nombre.trim())).findFirst().orElse(null);
    }
    private static String texto(String mensaje){
        while(true){System.out.print(mensaje);String s=sc.nextLine().trim();if(!s.isEmpty())return s;System.out.println("El dato no puede estar vacío.");}
    }
    private static int entero(String mensaje,int min,int max){
        while(true){System.out.print(mensaje);try{int n=Integer.parseInt(sc.nextLine().trim());if(n>=min&&n<=max)return n;}
            catch(NumberFormatException ignored){}System.out.println("Ingresa un número entero entre "+min+" y "+max+".");}
    }
    private static double decimal(String mensaje,double min,double max){
        while(true){System.out.print(mensaje);try{double n=Double.parseDouble(sc.nextLine().trim().replace(',','.'));
            if(Double.isFinite(n)&&n>=min&&n<=max)return n;}catch(NumberFormatException ignored){}
            System.out.println("Ingresa una calificación válida entre "+min+" y "+max+".");}
    }
    private static boolean confirmar(String m){System.out.print(m);return sc.nextLine().trim().equalsIgnoreCase("S");}
    private static String limitar(String s,int n){return s.length()>n?s.substring(0,n-1)+"…":s;}
    private static void guardar(){almacenamiento.guardar(estudiantes);}
}
