import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class GestorDatos {
    private final File archivo = new File("gradix_datos.dat");
    public List<Estudiante> cargar(){
        if(!archivo.exists()) return new ArrayList<>();
        try(ObjectInputStream in=new ObjectInputStream(new FileInputStream(archivo))){
            Object obj=in.readObject();
            if(obj instanceof List<?>) return (List<Estudiante>)obj;
        } catch(IOException | ClassNotFoundException e){
            System.out.println("Aviso: no se pudo leer el archivo de datos: "+e.getMessage());
            System.out.println("Se iniciará una lista vacía. Conserva una copia de " + archivo.getAbsolutePath());
        }
        return new ArrayList<>();
    }
    public void guardar(List<Estudiante> estudiantes){
        File temporal=new File("gradix_datos.tmp");
        try(ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream(temporal))){
            out.writeObject(estudiantes);
        } catch(IOException e){ throw new RuntimeException("No se pudieron guardar los datos: "+e.getMessage(),e); }
        if(archivo.exists() && !archivo.delete()) throw new RuntimeException("No se pudo reemplazar el archivo de datos.");
        if(!temporal.renameTo(archivo)) throw new RuntimeException("No se pudo finalizar el guardado.");
    }
}
