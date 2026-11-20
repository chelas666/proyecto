import java.io.Serializable;
import java.util.Locale;

public class Materia implements Serializable {

    private static final long serialVersionUID = 1L;

    private String nombre;
    private double parcial1;
    private double parcial2;
    private double parcial3;

    public Materia(String nombre, double p1, double p2, double p3) {
        this.nombre = nombre.trim();
        this.parcial1 = p1;
        this.parcial2 = p2;
        this.parcial3 = p3;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre.trim();
    }

    public double getParcial1() {
        return parcial1;
    }

    public double getParcial2() {
        return parcial2;
    }

    public double getParcial3() {
        return parcial3;
    }

    public void setParciales(double p1, double p2, double p3) {
        this.parcial1 = p1;
        this.parcial2 = p2;
        this.parcial3 = p3;
    }

    public double getFinal() {
        return (parcial1 + parcial2 + parcial3) / 3.0;
    }

    public boolean aprobada() {
        return getFinal() >= 6.0;
    }

    public boolean bajoRendimiento() {
        return getFinal() < 7.0;
    }

    public String estado() {
        return aprobada() ? "APROBADA" : "REPROBADA";
    }

    @Override
    public String toString() {
        return String.format(Locale.US,
                "%s | P1: %.2f | P2: %.2f | P3: %.2f | Final: %.2f | %s",
                nombre, parcial1, parcial2, parcial3, getFinal(), estado());
    }
}
