import java.util.Scanner;

// Estimador de costos de un servidor en la nube
// Compara un plan lineal contra uno cuadratico, encuentra el punto de equilibrio
// y recomienda el plan para un numero de usuarios dado.
public class EstimadorCostosNube {

    // Plan A (lineal):      C_A(n) = a*n + b
    static double a = 1.5;   // costo por usuario
    static double b = 40;    // cargo fijo mensual

    // Plan B (cuadratico):  C_B(n) = c*n^2 + d*n + e
    static double c = 0.01;  // cobro extra que crece con el cuadrado de usuarios
    static double d = 0.5;   // costo por usuario
    static double e = 10;    // cargo fijo mensual

    static double costoA(double n) {
        return a * n + b;
    }

    static double costoB(double n) {
        return c * n * n + d * n + e;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Estimador de costos de servidor en la nube");
        System.out.println("Plan A (lineal):     C(n) = " + a + "n + " + b);
        System.out.println("Plan B (cuadratico): C(n) = " + c + "n^2 + " + d + "n + " + e);
        System.out.println();

        // ---------- Punto de equilibrio ----------
        // Es un sistema 2x2 con incognitas (n, y):
        //     y = a*n + b
        //     y = c*n^2 + d*n + e
        // Por sustitucion (igualando) queda una ecuacion cuadratica:
        //     c*n^2 + (d - a)*n + (e - b) = 0
        double A = c;
        double B = d - a;
        double C = e - b;

        double discriminante = B * B - 4 * A * C;

        if (discriminante < 0) {
            System.out.println("Las graficas no se cruzan: un plan siempre es mas barato que el otro.");
        } else {
            double n1 = (-B + Math.sqrt(discriminante)) / (2 * A);
            double n2 = (-B - Math.sqrt(discriminante)) / (2 * A);

            // Solo sirven las soluciones positivas (no existen usuarios negativos)
            double equilibrio = -1;
            if (n1 > 0) {
                equilibrio = n1;
            }
            if (n2 > 0) {
                equilibrio = n2;
            }

            if (equilibrio < 0) {
                System.out.println("No hay punto de equilibrio con usuarios positivos.");
            } else {
                System.out.printf("Punto de equilibrio: n = %.2f usuarios, costo = $%.2f%n",
                        equilibrio, costoA(equilibrio));
            }
        }

        System.out.println();

        // ---------- Tabla de costos ----------
        System.out.println("Usuarios | Plan A    | Plan B");
        for (int n = 0; n <= 300; n += 50) {
            System.out.printf("%8d | $%8.2f | $%8.2f%n", n, costoA(n), costoB(n));
        }

        System.out.println();

        // ---------- Recomendacion ----------
        System.out.print("¿Cuantos usuarios tendras? ");
        int usuarios = sc.nextInt();

        double ca = costoA(usuarios);
        double cb = costoB(usuarios);
        System.out.printf("Plan A: $%.2f%n", ca);
        System.out.printf("Plan B: $%.2f%n", cb);

        if (ca < cb) {
            System.out.println("Recomendacion: Plan A (lineal), es mas barato para ese numero de usuarios.");
        } else if (cb < ca) {
            System.out.println("Recomendacion: Plan B (cuadratico), es mas barato para ese numero de usuarios.");
        } else {
            System.out.println("Ambos planes cuestan lo mismo.");
        }

        sc.close();
    }
}
