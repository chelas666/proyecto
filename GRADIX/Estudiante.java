import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Estudiante implements Serializable {
    private static final long serialVersionUID = 1L;
    private String nombre;
    private final List<Materia> materias = new ArrayList<>();

    public Estudiante(String nombre){ this.nombre=nombre.trim(); }
    public String getNombre(){ return nombre; }
    public void setNombre(String nombre){ this.nombre=nombre.trim(); }
    public List<Materia> getMaterias(){ return materias; }
    public Materia buscarMateria(String nombre){
        return materias.stream().filter(m->m.getNombre().equalsIgnoreCase(nombre.trim())).findFirst().orElse(null);
    }
    public double promedioGeneral(){
        if(materias.isEmpty()) return 0;
        return materias.stream().mapToDouble(Materia::getFinal).average().orElse(0);
    }
    public double promedioPonderado(){
        int total=materias.stream().mapToInt(Materia::getCreditos).sum();
        if(total==0) return 0;
        return materias.stream().mapToDouble(m->m.getFinal()*m.getCreditos()).sum()/total;
    }
    public long aprobadas(){ return materias.stream().filter(Materia::aprobada).count(); }
    public long reprobadas(){ return materias.size()-aprobadas(); }
}
